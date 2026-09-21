using BusinessPortal.API.DTOs;

namespace BusinessPortal.API.Plans;

// The annual subscription catalogue shared by the subscription endpoints and
// the product-limit enforcement. Silver 10 products, Gold 25, Platinum unlimited.
// Each product also caps how many units of stock a business may hold per item.
public static class SubscriptionPlans
{
    public static readonly IReadOnlyList<PlanDto> All = new List<PlanDto>
    {
        new("Silver", 12, 1500m,
            "Budget-friendly annual plan - sell up to 10 products with up to 20 units of stock each", 10, 20),
        new("Gold", 12, 2800m,
            "Most popular - sell up to 25 products with up to 40 units of stock each", 25, 40),
        new("Platinum", 12, 5000m,
            "Best value - sell unlimited products with unlimited stock", null, null),
    };

    public static PlanDto? Find(string name) =>
        All.FirstOrDefault(p => p.Name.Equals(name, StringComparison.OrdinalIgnoreCase));
}