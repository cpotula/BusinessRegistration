using BusinessPortal.API.Data;
using Microsoft.EntityFrameworkCore;

namespace BusinessPortal.API.Services;

// Core business rule from the functional spec: "Subscription based. Page
// disabled after expiry." Runs at startup and then hourly so expired listings
// are disabled without waiting for an administrator to trigger the check.
public class SubscriptionExpiryService : BackgroundService
{
    private static readonly TimeSpan Interval = TimeSpan.FromHours(1);
    private readonly IServiceScopeFactory _scopeFactory;
    private readonly ILogger<SubscriptionExpiryService> _logger;

    public SubscriptionExpiryService(IServiceScopeFactory scopeFactory, ILogger<SubscriptionExpiryService> logger)
    {
        _scopeFactory = scopeFactory;
        _logger = logger;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        while (!stoppingToken.IsCancellationRequested)
        {
            try
            {
                await DisableExpiredAsync(stoppingToken);
            }
            catch (Exception ex) when (ex is not OperationCanceledException)
            {
                _logger.LogError(ex, "Subscription expiry processing failed.");
            }

            try
            {
                await Task.Delay(Interval, stoppingToken);
            }
            catch (OperationCanceledException)
            {
                break;
            }
        }
    }

    private async Task DisableExpiredAsync(CancellationToken ct)
    {
        using var scope = _scopeFactory.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();

        var now = DateTime.UtcNow;
        var expired = await db.Businesses
            .Where(b => b.IsActive
                && b.SubscriptionExpiresOn != null
                && b.SubscriptionExpiresOn < now)
            .ToListAsync(ct);

        if (expired.Count == 0)
            return;

        foreach (var business in expired)
        {
            business.IsActive = false;
        }

        await db.SaveChangesAsync(ct);
        _logger.LogInformation("Disabled {Count} business listing(s) with expired subscriptions.", expired.Count);
    }
}
