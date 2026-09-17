using BusinessPortal.API.DTOs;

namespace BusinessPortal.API.Plans;

// The annual subscription catalogue shared by the subscription endpoints and
// the product-limit enforcement. Base 10, Standard 60, Gold unlimited products.
public static class SubscriptionPlans
{
    public static readonly IReadOnlyList<PlanDto> All = new List<PlanDto>
    {
        new("Base", 12, 1500m,
            "Budget-friendly annual plan - list up to 10 products for a year", 10),
        new("Standard", 12, 2800m,
            "Most popular - list up to 60 products for a year", 60),
        new("Gold", 12, 5000m,
            "Best value - sell unlimited products all year", null),
    };

    public static PlanDto? Find(string name) =>
        All.FirstOrDefault(p => p.Name.Equals(name, StringComparison.OrdinalIgnoreCase));
}