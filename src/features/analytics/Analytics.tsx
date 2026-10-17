import { TrendingUp, BarChart3, DollarSign, Users, Package, CreditCard, Calendar, ChevronLeft, ChevronRight } from 'lucide-react'
import { useState } from 'react'

export function Analytics() {
  const [period, setPeriod] = useState<'daily' | 'weekly' | 'monthly'>('monthly')

  const periods = [
    { id: 'daily', label: 'Daily' },
    { id: 'weekly', label: 'Weekly' },
    { id: 'monthly', label: 'Monthly' },
  ]

  const metrics = [
    { name: 'Total Sales', value: '₹1,25,000', change: '+12%', trend: 'up' },
    { name: 'Total Expenses', value: '₹45,000', change: '-5%', trend: 'down' },
    { name: 'Net Profit', value: '₹80,000', change: '+18%', trend: 'up' },
    { name: 'Outstanding Credit', value: '₹22,500', change: '+3%', trend: 'up' },
  ]

  const salesData = [
    { period: 'Week 1', sales: 25000, expenses: 10000 },
    { period: 'Week 2', sales: 32000, expenses: 12000 },
    { period: 'Week 3', sales: 28000, expenses: 11000 },
    { period: 'Week 4', sales: 40000, expenses: 12000 },
  ]

  const topProducts = [
    { name: 'Basmati Rice 1kg', sold: 120, revenue: 10200 },
    { name: 'Toor Dal 1kg', sold: 85, revenue: 10200 },
    { name: 'Sunflower Oil 1L', sold: 45, revenue: 6525 },
    { name: 'Biscuits Packet', sold: 200, revenue: 5000 },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
          <p className="text-gray-600 mt-1">Business performance insights</p>
        </div>
        <div className="flex gap-2">
          {periods.map((p) => (
            <button
              key={p.id}
              onClick={() => setPeriod(p.id as any)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                period === p.id
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {metrics.map((metric) => (
          <div key={metric.name} className="card">
            <div className="card-body">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">{metric.name}</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{metric.value}</p>
                </div>
                <div className={`h-12 w-12 rounded-lg flex items-center justify-center ${
                  metric.trend === 'up' ? 'bg-green-100' : 'bg-red-100'
                }`}>
                  <TrendingUp className={`h-6 w-6 ${metric.trend === 'up' ? 'text-green-600' : 'text-red-600'}`} />
                </div>
              </div>
              <p className={`text-sm font-medium mt-2 ${metric.trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
                {metric.change} vs last period
              </p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="card">
          <div className="card-header flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">Sales vs Expenses</h2>
            <div className="flex gap-2">
              <button className="p-1 rounded hover:bg-gray-100" disabled><ChevronLeft className="h-4 w-4" /></button>
              <button className="p-1 rounded hover:bg-gray-100"><ChevronRight className="h-4 w-4" /></button>
            </div>
          </div>
          <div className="card-body">
            <div className="h-64 flex items-end justify-around gap-4 px-4">
              {salesData.map((d, i) => (
                <div key={d.period} className="flex-1 flex flex-col items-center gap-2">
                  <div className="w-full flex gap-1 justify-center items-end h-40">
                    <div
                      className="w-8 bg-primary-600 rounded-t transition-all hover:bg-primary-700"
                      style={{ height: `${(d.sales / 40000) * 100}%` }}
                      title={`Sales: ₹${d.sales.toLocaleString()}`}
                    />
                    <div
                      className="w-8 bg-red-500 rounded-t transition-all hover:bg-red-600"
                      style={{ height: `${(d.expenses / 12000) * 100}%` }}
                      title={`Expenses: ₹${d.expenses.toLocaleString()}`}
                    />
                  </div>
                  <span className="text-xs text-gray-600">{d.period}</span>
                </div>
              ))}
            </div>
            <div className="flex gap-6 mt-4 justify-center text-sm">
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded bg-primary-600" />
                <span>Sales</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded bg-red-500" />
                <span>Expenses</span>
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <h2 className="text-lg font-semibold text-gray-900">Top Selling Products</h2>
          </div>
          <div className="card-body">
            <div className="space-y-4">
              {topProducts.map((product, index) => (
                <div key={product.name} className="flex items-center gap-4">
                  <div className="h-8 w-8 rounded-lg bg-primary-100 flex items-center justify-center text-primary-600 font-bold">
                    {index + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 truncate">{product.name}</p>
                    <p className="text-sm text-gray-600">{product.sold} units sold</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-gray-900">₹{product.revenue.toLocaleString()}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="card">
          <div className="card-header">
            <h2 className="text-lg font-semibold text-gray-900">Customer Insights</h2>
          </div>
          <div className="card-body space-y-4">
            <div className="flex justify-between">
              <span className="text-gray-600">Active Customers</span>
              <span className="font-medium text-gray-900">24</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">New This Month</span>
              <span className="font-medium text-gray-900">3</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">With Outstanding Credit</span>
              <span className="font-medium text-red-600">8</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Overdue</span>
              <span className="font-medium text-red-600">2</span>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <h2 className="text-lg font-semibold text-gray-900">Inventory Health</h2>
          </div>
          <div className="card-body space-y-4">
            <div className="flex justify-between">
              <span className="text-gray-600">Total Products</span>
              <span className="font-medium text-gray-900">156</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Low Stock</span>
              <span className="font-medium text-yellow-600">12</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Out of Stock</span>
              <span className="font-medium text-red-600">3</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Total Stock Value</span>
              <span className="font-medium text-gray-900">₹2,45,000</span>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <h2 className="text-lg font-semibold text-gray-900">Payment Methods</h2>
          </div>
          <div className="card-body space-y-4">
            <div className="flex justify-between">
              <span className="text-gray-600">Cash</span>
              <span className="font-medium text-gray-900">45%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">UPI</span>
              <span className="font-medium text-gray-900">35%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Card</span>
              <span className="font-medium text-gray-900">15%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Bank Transfer</span>
              <span className="font-medium text-gray-900">5%</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}