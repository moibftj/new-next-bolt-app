'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Download, Users, Briefcase, FileText, DollarSign, TrendingUp } from 'lucide-react'
import { supabase } from '@/lib/supabase'

interface UserData {
  id: string
  name: string
  email: string
  role: string
  is_subscribed: boolean
  subscription_plan: string | null
  created_at: string
  letter_count: number
  total_spent: number
}

interface EmployeeData {
  id: string
  name: string
  email: string
  coupon_code: string
  points: number
  commission_earned: number
  usage_count: number
  total_revenue_generated: number
  created_at: string
}

interface LetterData {
  id: string
  title: string
  user_name: string
  user_email: string
  status: string
  created_at: string
}

export function AdminTables() {
  const [users, setUsers] = useState<UserData[]>([])
  const [employees, setEmployees] = useState<EmployeeData[]>([])
  const [letters, setLetters] = useState<LetterData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [stats, setStats] = useState({
    total_users: 0,
    total_employees: 0,
    total_letters: 0,
    total_revenue: 0,
    total_commissions: 0
  })

  useEffect(() => {
    loadAdminData()
  }, [])

  const loadAdminData = async () => {
    try {
      setLoading(true)
      
      // Load users with aggregated data
      const { data: usersData, error: usersError } = await supabase
        .from('profiles')
        .select(`
          id, name, email, role, is_subscribed, subscription_plan, created_at,
          letters:letters(count),
          transactions:transactions(amount_cents)
        `)
        .eq('role', 'user')
        .order('created_at', { ascending: false })

      if (usersError) throw usersError

      // Load employees with aggregated data
      const { data: employeesData, error: employeesError } = await supabase
        .from('profiles')
        .select(`
          id, name, email, points, commission_earned, created_at,
          employees_meta:employees_meta(coupon_code),
          coupon_usage:coupon_usage(count, revenue)
        `)
        .eq('role', 'employee')
        .order('created_at', { ascending: false })

      if (employeesError) throw employeesError

      // Load letters
      const { data: lettersData, error: lettersError } = await supabase
        .from('letters')
        .select(`
          id, title, status, created_at,
          profiles:user_id(name, email)
        `)
        .order('created_at', { ascending: false })
        .limit(100)

      if (lettersError) throw lettersError

      // Process users data
      const processedUsers: UserData[] = usersData?.map(user => ({
        id: user.id,
        name: user.name || '',
        email: user.email || '',
        role: user.role,
        is_subscribed: user.is_subscribed || false,
        subscription_plan: user.subscription_plan,
        created_at: user.created_at,
        letter_count: user.letters?.length || 0,
        total_spent: (user.transactions?.reduce((sum: number, t: any) => sum + (t.amount_cents / 100), 0)) || 0
      })) || []

      // Process employees data
      const processedEmployees: EmployeeData[] = employeesData?.map(emp => ({
        id: emp.id,
        name: emp.name || '',
        email: emp.email || '',
        coupon_code: emp.employees_meta?.coupon_code || '',
        points: emp.points || 0,
        commission_earned: emp.commission_earned || 0,
        usage_count: emp.coupon_usage?.length || 0,
        total_revenue_generated: emp.coupon_usage?.reduce((sum: number, usage: any) => sum + (usage.revenue || 0), 0) || 0,
        created_at: emp.created_at
      })) || []

      // Process letters data
      const processedLetters: LetterData[] = lettersData?.map(letter => ({
        id: letter.id,
        title: letter.title || 'Untitled',
        user_name: letter.profiles?.name || 'Unknown',
        user_email: letter.profiles?.email || 'Unknown',
        status: letter.status,
        created_at: letter.created_at
      })) || []

      // Calculate stats
      const totalRevenue = processedUsers.reduce((sum, user) => sum + user.total_spent, 0)
      const totalCommissions = processedEmployees.reduce((sum, emp) => sum + emp.commission_earned, 0)

      setUsers(processedUsers)
      setEmployees(processedEmployees)
      setLetters(processedLetters)
      setStats({
        total_users: processedUsers.length,
        total_employees: processedEmployees.length,
        total_letters: processedLetters.length,
        total_revenue: totalRevenue,
        total_commissions: totalCommissions
      })

    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const exportToCSV = (data: any[], filename: string) => {
    if (!data.length) return

    const headers = Object.keys(data[0]).join(',')
    const csvContent = [
      headers,
      ...data.map(row => Object.values(row).map(value => 
        typeof value === 'string' && value.includes(',') ? `"${value}"` : value
      ).join(','))
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${filename}-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-24 bg-gray-100 rounded-lg animate-pulse"></div>
          ))}
        </div>
        <div className="h-96 bg-gray-100 rounded-lg animate-pulse"></div>
      </div>
    )
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    )
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'posted': return 'bg-green-100 text-green-800'
      case 'under_review': return 'bg-yellow-100 text-yellow-800'
      case 'received': return 'bg-blue-100 text-blue-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="space-y-6">
      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <Users className="w-8 h-8 text-blue-600 mx-auto mb-2" />
            <h3 className="text-2xl font-bold text-gray-900">{stats.total_users}</h3>
            <p className="text-sm text-gray-600">Total Users</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <Briefcase className="w-8 h-8 text-emerald-600 mx-auto mb-2" />
            <h3 className="text-2xl font-bold text-gray-900">{stats.total_employees}</h3>
            <p className="text-sm text-gray-600">Employees</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <FileText className="w-8 h-8 text-purple-600 mx-auto mb-2" />
            <h3 className="text-2xl font-bold text-gray-900">{stats.total_letters}</h3>
            <p className="text-sm text-gray-600">Letters Generated</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <DollarSign className="w-8 h-8 text-green-600 mx-auto mb-2" />
            <h3 className="text-2xl font-bold text-gray-900">${stats.total_revenue.toFixed(2)}</h3>
            <p className="text-sm text-gray-600">Total Revenue</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <TrendingUp className="w-8 h-8 text-orange-600 mx-auto mb-2" />
            <h3 className="text-2xl font-bold text-gray-900">${stats.total_commissions.toFixed(2)}</h3>
            <p className="text-sm text-gray-600">Total Commissions</p>
          </CardContent>
        </Card>
      </div>

      {/* Data Tables */}
      <Tabs defaultValue="users" className="space-y-4">
        <TabsList>
          <TabsTrigger value="users">Users ({stats.total_users})</TabsTrigger>
          <TabsTrigger value="employees">Employees ({stats.total_employees})</TabsTrigger>
          <TabsTrigger value="letters">Letters ({stats.total_letters})</TabsTrigger>
        </TabsList>

        <TabsContent value="users">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>User Management</CardTitle>
                  <CardDescription>Manage user accounts and subscriptions</CardDescription>
                </div>
                <Button 
                  onClick={() => exportToCSV(users, 'users')}
                  variant="outline"
                  className="flex items-center space-x-2"
                >
                  <Download className="w-4 h-4" />
                  <span>Export CSV</span>
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Subscription</TableHead>
                    <TableHead>Letters</TableHead>
                    <TableHead>Total Spent</TableHead>
                    <TableHead>Joined</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium">{user.name}</TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>
                        {user.is_subscribed ? (
                          <Badge variant="default">{user.subscription_plan}</Badge>
                        ) : (
                          <Badge variant="secondary">Free</Badge>
                        )}
                      </TableCell>
                      <TableCell>{user.letter_count}</TableCell>
                      <TableCell>${user.total_spent.toFixed(2)}</TableCell>
                      <TableCell>
                        {new Date(user.created_at).toLocaleDateString()}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="employees">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Employee Management</CardTitle>
                  <CardDescription>Track employee performance and commissions</CardDescription>
                </div>
                <Button 
                  onClick={() => exportToCSV(employees, 'employees')}
                  variant="outline"
                  className="flex items-center space-x-2"
                >
                  <Download className="w-4 h-4" />
                  <span>Export CSV</span>
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Coupon Code</TableHead>
                    <TableHead>Points</TableHead>
                    <TableHead>Commission</TableHead>
                    <TableHead>Usage Count</TableHead>
                    <TableHead>Revenue Generated</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {employees.map((employee) => (
                    <TableRow key={employee.id}>
                      <TableCell className="font-medium">{employee.name}</TableCell>
                      <TableCell>{employee.email}</TableCell>
                      <TableCell>
                        <code className="bg-gray-100 px-2 py-1 rounded text-sm">
                          {employee.coupon_code}
                        </code>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">{employee.points}</Badge>
                      </TableCell>
                      <TableCell className="text-green-600 font-semibold">
                        ${employee.commission_earned.toFixed(2)}
                      </TableCell>
                      <TableCell>{employee.usage_count}</TableCell>
                      <TableCell className="font-semibold">
                        ${employee.total_revenue_generated.toFixed(2)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="letters">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Letter Management</CardTitle>
                  <CardDescription>View all generated letters</CardDescription>
                </div>
                <Button 
                  onClick={() => exportToCSV(letters, 'letters')}
                  variant="outline"
                  className="flex items-center space-x-2"
                >
                  <Download className="w-4 h-4" />
                  <span>Export CSV</span>
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>User</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Created</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {letters.map((letter) => (
                    <TableRow key={letter.id}>
                      <TableCell className="font-medium">{letter.title}</TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{letter.user_name}</p>
                          <p className="text-sm text-gray-500">{letter.user_email}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(letter.status)}>
                          {letter.status.replace('_', ' ').toUpperCase()}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {new Date(letter.created_at).toLocaleDateString()}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}