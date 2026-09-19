using BusinessPortal.API.Data;
using BusinessPortal.API.DTOs;
using BusinessPortal.API.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Globalization;
using System.Security.Claims;

namespace BusinessPortal.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class OrdersController : ControllerBase
{
    private readonly AppDbContext _db;

    public OrdersController(AppDbContext db)
    {
        _db = db;
    }

    private int GetUserId() => int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

    private async Task<List<int>> GetOwnerBusinessIds(int userId) =>
        await _db.Businesses.Where(b => b.OwnerUserId == userId).Select(b => b.Id).ToListAsync();

    // A logged-in user checks out their cart. Prices/businesses are taken from
    // the database (never trusted from the client).
    [HttpPost]
    [Authorize]
    public async Task<IActionResult> PlaceOrder([FromBody] PlaceOrderRequest request)
    {
        var items = request?.Items ?? new List<PlaceOrderItemRequest>();
        if (items.Count == 0)
            return BadRequest(new { message = "Your cart is empty." });
        if (items.Any(i => i.Quantity <= 0))
            return BadRequest(new { message = "Invalid item quantity." });

        var productIds = items.Select(i => i.ProductId).Distinct().ToList();
        if (productIds.Count != items.Count)
            return BadRequest(new { message = "Duplicate product in cart." });

        var user = await _db.Users.FindAsync(GetUserId());
        if (user is null)
            return Unauthorized(new { message = "Login required to place an order." });

        var products = await _db.Products
            .Where(p => productIds.Contains(p.Id))
            .Include(p => p.Business)
            .ToListAsync();

        var orderItems = new List<OrderItem>();
        foreach (var req in items)
        {
            var product = products.FirstOrDefault(p => p.Id == req.ProductId);
            if (product is null || product.Business is null || !product.IsActive || !product.IsApproved)
                return BadRequest(new { message = $"Product #{req.ProductId} is not available for purchase." });

            orderItems.Add(new OrderItem
            {
                ProductId = product.Id,
                ProductName = product.Name,
                BusinessId = product.BusinessId,
                BusinessName = product.Business.Name,
                UnitPrice = product.Price ?? 0,
                Quantity = req.Quantity
            });
        }

        var total = orderItems.Sum(i => i.UnitPrice * i.Quantity);

        var order = new Order
        {
            OrderNumber = $"ORD-{DateTime.UtcNow:yyyyMMddHHmmss}{Guid.NewGuid().ToString("N")[..6]}",
            CustomerUserId = user.Id,
            CustomerName = user.Name,
            CustomerEmail = user.Email,
            CustomerPhone = user.Phone,
            TotalAmount = total,
            Status = "Pending",
            Items = orderItems
        };

        _db.Orders.Add(order);
        await _db.SaveChangesAsync();

        return Ok(ToDto(order));
    }

    // Business owners see the order requests that include any of their products.
    [HttpGet("for-my-businesses")]
    [Authorize(Roles = "BusinessOwner")]
    public async Task<IActionResult> GetForMyBusinesses()
    {
        var businessIds = await GetOwnerBusinessIds(GetUserId());
        if (businessIds.Count == 0)
            return Ok(new List<OrderDto>());

        var orders = await _db.Orders
            .Where(o => o.Items.Any(i => businessIds.Contains(i.BusinessId)))
            .Include(o => o.Items)
            .OrderByDescending(o => o.CreatedAt)
            .ToListAsync();

        var images = await BuildImageMap(orders);
        return Ok(orders.Select(o => ToDto(o, images)).ToList());
    }

    // A buyer sees their own order requests and their confirmation status.
    [HttpGet("my")]
    [Authorize]
    public async Task<IActionResult> GetMyOrders()
    {
        var orders = await _db.Orders
            .Where(o => o.CustomerUserId == GetUserId())
            .Include(o => o.Items)
            .OrderByDescending(o => o.CreatedAt)
            .ToListAsync();

        var images = await BuildImageMap(orders);
        return Ok(orders.Select(o => ToDto(o, images)).ToList());
    }

    // The business owner confirms the order request from a user.
    [HttpPut("{id}/accept")]
    [Authorize(Roles = "BusinessOwner")]
    public async Task<IActionResult> Accept(int id)
    {
        var businessIds = await GetOwnerBusinessIds(GetUserId());
        if (businessIds.Count == 0)
            return Forbid();

        var order = await _db.Orders.Include(o => o.Items).FirstOrDefaultAsync(o => o.Id == id);
        if (order is null)
            return NotFound(new { message = "Order not found." });
        if (!order.Items.Any(i => businessIds.Contains(i.BusinessId)))
            return Forbid();

        if (order.Status != "Pending")
            return BadRequest(new { message = "This order has already been confirmed." });

        order.Status = "Confirmed";
        await _db.SaveChangesAsync();

        _db.Notifications.Add(new Notification
        {
            UserId = order.CustomerUserId,
            Title = "Order confirmed",
            Message = $"Great news! The seller has confirmed your order #{order.OrderNumber}. Please finalize the payment and delivery with them. Track it under My Orders.",
            Link = "/my-orders",
        });
        await _db.SaveChangesAsync();

        return Ok(ToDto(order));
    }

    // Order fulfilment flow the seller controls: the customer gets a
    // notification at every step (confirmed -> packed -> in transit ->
    // out for delivery -> delivered).
    private static readonly string[] StatusFlow = { "Pending", "Confirmed", "Packed", "InTransit", "OutForDelivery", "Delivered" };

    [HttpPut("{id}/status")]
    [Authorize(Roles = "BusinessOwner")]
    public async Task<IActionResult> SetStatus(int id, [FromBody] OrderStatusUpdateRequest request)
    {
        var businessIds = await GetOwnerBusinessIds(GetUserId());
        if (businessIds.Count == 0)
            return Forbid();

        var order = await _db.Orders.Include(o => o.Items).FirstOrDefaultAsync(o => o.Id == id);
        if (order is null)
            return NotFound(new { message = "Order not found." });
        if (!order.Items.Any(i => businessIds.Contains(i.BusinessId)))
            return Forbid();

        var next = request?.Status ?? "";
        var currentIdx = Array.IndexOf(StatusFlow, order.Status);
        var nextIdx = Array.IndexOf(StatusFlow, next);
        if (currentIdx < 0 || nextIdx < 0)
            return BadRequest(new { message = "Unknown order status." });
        if (nextIdx != currentIdx + 1)
            return BadRequest(new { message = "Order status can only move one step forward." });

        order.Status = next;
        await _db.SaveChangesAsync();

        var (title, message) = StatusNotification(next, order.OrderNumber);
        _db.Notifications.Add(new Notification
        {
            UserId = order.CustomerUserId,
            Title = title,
            Message = message,
            Link = "/my-orders",
        });
        await _db.SaveChangesAsync();

        return Ok(ToDto(order));
    }

    private static (string Title, string Message) StatusNotification(string status, string orderNumber) => status switch
    {
        "Confirmed" => (
            "Order confirmed",
            $"Great news! The seller has confirmed your order #{orderNumber}. Please finalize the payment and delivery with them. Track it under My Orders."),
        "Packed" => (
            "Order packed",
            $"Good news! Your order #{orderNumber} has been packed and is ready for the delivery partner."),
        "InTransit" => (
            "Order in transit",
            $"Your order #{orderNumber} has been dispatched and is now on its way in transit."),
        "OutForDelivery" => (
            "Order out for delivery",
            $"Your order #{orderNumber} is out for delivery! Expect it at your doorstep soon."),
        "Delivered" => (
            "Order delivered",
            $"Your order #{orderNumber} has been delivered. Thank you for shopping with us!"),
        _ => ("Order updated", $"There is an update on your order #{orderNumber}."),
    };
    // grouped by today / this month / this year.
    [HttpGet("sold")]
    [Authorize(Roles = "BusinessOwner,Admin")]
    public async Task<IActionResult> GetSold([FromQuery] int businessId)
    {
        if (!await IsOwnBusiness(businessId))
            return Forbid();

        var now = DateTime.UtcNow;
        var todayStart = now.Date;
        var monthStart = new DateTime(now.Year, now.Month, 1);
        var yearStart = new DateTime(now.Year, 1, 1);

        var items = await _db.OrderItems
            .Include(i => i.Order)
            .Where(i => i.BusinessId == businessId && i.Order!.Status == "Confirmed")
            .ToListAsync();

        var productIds = items.Select(i => i.ProductId).Distinct().ToList();
        var imageRows = productIds.Count > 0
            ? await _db.ProductImages.Where(im => productIds.Contains(im.ProductId)).ToListAsync()
            : new List<ProductImage>();
        var images = imageRows
            .GroupBy(im => im.ProductId)
            .ToDictionary(g => g.Key, g => g.OrderBy(x => x.SortOrder).Select(x => x.Url).FirstOrDefault());

        var perProduct = new Dictionary<int, SoldPerProductDto>();
        foreach (var i in items)
        {
            var created = i.Order!.CreatedAt;
            var today = created >= todayStart ? i.Quantity : 0;
            var month = created >= monthStart ? i.Quantity : 0;
            var year = created >= yearStart ? i.Quantity : 0;
            var revenue = i.UnitPrice * i.Quantity;
            var revToday = created >= todayStart ? revenue : 0;
            var revMonth = created >= monthStart ? revenue : 0;
            var revYear = created >= yearStart ? revenue : 0;

            if (!perProduct.TryGetValue(i.ProductId, out var dto))
            {
                dto = new SoldPerProductDto(i.ProductId, i.ProductName, images.GetValueOrDefault(i.ProductId), 0, 0, 0, 0, 0, 0);
                perProduct[i.ProductId] = dto;
            }
            dto = dto with
            {
                SoldToday = dto.SoldToday + today,
                SoldThisMonth = dto.SoldThisMonth + month,
                SoldThisYear = dto.SoldThisYear + year,
                RevenueToday = dto.RevenueToday + revToday,
                RevenueThisMonth = dto.RevenueThisMonth + revMonth,
                RevenueThisYear = dto.RevenueThisYear + revYear,
            };
            perProduct[i.ProductId] = dto;
        }

        var list = perProduct.Values.OrderBy(p => p.ProductName.ToLower()).ToList();
        var summary = new SoldSummaryDto(
            list.Sum(p => p.SoldToday),
            list.Sum(p => p.SoldThisMonth),
            list.Sum(p => p.SoldThisYear),
            list.Sum(p => p.RevenueToday),
            list.Sum(p => p.RevenueThisMonth),
            list.Sum(p => p.RevenueThisYear),
            list);

        return Ok(summary);
    }

    // Time-series of confirmed-order sales covering the entire recorded
    // history (all months, all quarters, per year) so the UI can drill down
    // into a specific month, quarter or year. For the owner's own business.
    [HttpGet("sold-by-period")]
    [Authorize(Roles = "BusinessOwner,Admin")]
    public async Task<IActionResult> GetSoldByPeriod([FromQuery] int businessId)
    {
        if (!await IsOwnBusiness(businessId))
            return Forbid();

        var now = DateTime.UtcNow;
        var items = await _db.OrderItems
            .Include(i => i.Order)
            .Where(i => i.BusinessId == businessId && i.Order!.Status == "Confirmed")
            .ToListAsync();

        var currentMonth = new DateTime(now.Year, now.Month, 1);
        static DateTime StartOfQuarter(DateTime d) => new DateTime(d.Year, ((d.Month - 1) / 3) * 3 + 1, 1);

        // Build the full calendar from a baseline year so every month (Jan–Dec),
        // every quarter (Q1–Q4) and every year is selectable even when a period
        // has no confirmed orders. Baseline = previous year, or the first year
        // with orders if that is earlier.
        var firstDataYear = items.Count > 0 ? items.Min(i => i.Order!.CreatedAt.Year) : now.Year;
        var baselineYear = Math.Min(firstDataYear, now.Year - 1);
        var baseline = new DateTime(baselineYear, 1, 1, 0, 0, 0, DateTimeKind.Utc);

        var monthly = new List<SoldPeriodPointDto>();
        for (var cursor = baseline; cursor <= currentMonth; cursor = cursor.AddMonths(1))
            monthly.Add(BuildPoint(cursor, cursor.AddMonths(1), items, cursor.ToString("MMM yyyy", CultureInfo.InvariantCulture)));

        var firstQuarter = StartOfQuarter(baseline);
        var currentQuarter = StartOfQuarter(now);

        var quarterly = new List<SoldPeriodPointDto>();
        for (var cursor = firstQuarter; cursor <= currentQuarter; cursor = cursor.AddMonths(3))
        {
            var q = (cursor.Month - 1) / 3 + 1;
            quarterly.Add(BuildPoint(cursor, cursor.AddMonths(3), items, $"Q{q} {cursor.Year}"));
        }

        var yearly = new List<SoldPeriodPointDto>();
        for (var y = baselineYear; y <= now.Year; y++)
            yearly.Add(BuildPoint(
                new DateTime(y, 1, 1, 0, 0, 0, DateTimeKind.Utc),
                new DateTime(y + 1, 1, 1, 0, 0, 0, DateTimeKind.Utc),
                items, y.ToString(CultureInfo.InvariantCulture)));

        return Ok(new SoldByPeriodDto(monthly, quarterly, yearly));
    }

    private static SoldPeriodPointDto BuildPoint(DateTime from, DateTime to, List<OrderItem> items, string key)
    {
        var units = 0;
        decimal revenue = 0;
        foreach (var i in items)
        {
            var created = i.Order!.CreatedAt;
            if (created >= from && created < to)
            {
                units += i.Quantity;
                revenue += i.UnitPrice * i.Quantity;
            }
        }
        return new SoldPeriodPointDto(key, units, revenue);
    }

    private async Task<bool> IsOwnBusiness(int businessId)
    {
        if (User.IsInRole("Admin")) return true;
        var business = await _db.Businesses.FindAsync(businessId);
        return business is not null && business.OwnerUserId == GetUserId();
    }

    // Admin can inspect the order requests placed against any business.
    [HttpGet("admin/business/{businessId:int}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> GetBusinessOrders(int businessId)
    {
        var orders = await _db.Orders
            .Where(o => o.Items.Any(i => i.BusinessId == businessId))
            .Include(o => o.Items)
            .OrderByDescending(o => o.CreatedAt)
            .ToListAsync();

        var images = await BuildImageMap(orders);
        return Ok(orders.Select(o => ToDto(o, images)).ToList());
    }

    private async Task<Dictionary<int, string?>> BuildImageMap(List<Order> orders)
    {
        var productIds = orders.SelectMany(o => o.Items).Select(i => i.ProductId).Distinct().ToList();
        if (productIds.Count == 0)
            return new Dictionary<int, string?>();

        var imageRows = await _db.ProductImages.Where(im => productIds.Contains(im.ProductId)).ToListAsync();
        return imageRows
            .GroupBy(im => im.ProductId)
            .ToDictionary(g => g.Key, g => g.OrderBy(x => x.SortOrder).Select(x => x.Url).FirstOrDefault());
    }

    private static OrderDto ToDto(Order order, Dictionary<int, string?>? images = null)
    {
        return new OrderDto(
            order.Id,
            order.OrderNumber,
            order.CustomerName,
            order.CustomerEmail,
            order.CustomerPhone,
            order.TotalAmount,
            order.Status,
            order.CreatedAt,
            order.Items.Select(i => new OrderItemDto(
                i.Id,
                i.ProductId,
                i.ProductName,
                i.BusinessId,
                i.BusinessName,
                i.UnitPrice,
                i.Quantity,
                images?.GetValueOrDefault(i.ProductId)
            )).ToList());
    }
}