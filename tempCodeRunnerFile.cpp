#include <bits/stdc++.h>
using namespace std;

struct Item {
    double value, weight;
};

// Comparator: sort by value/weight ratio (descending)
bool cmp(const Item &a, const Item &b) {
    return (a.value / a.weight) > (b.value / b.weight);
}

double fractionalKnapsack(vector<Item> &items, double W) {
    sort(items.begin(), items.end(), cmp);
    double totalValue = 0.0;

    for (auto &item : items) {
        if (W <= 0) break;
        if (item.weight <= W) {
            // take full item
            totalValue += item.value;
            W -= item.weight;
        } else {
            // take fraction
            totalValue += (item.value / item.weight) * W;
            W = 0;
        }
    }
    return totalValue;
}

int main() {
    vector<Item> items = {{60, 10}, {100, 20}, {120, 30}};
    double capacity = 50;

    cout << fixed << setprecision(2);
    cout << "Maximum value = " << fractionalKnapsack(items, capacity) << "\n";
    return 0;
}
