"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"
import { Bell, Building, CreditCard, Lock, Save, User, Users } from "lucide-react"
import { I18nSettings } from "@/components/i18n-settings"
import { useI18n } from "@/i18n/i18n-provider"
import { useResponsive } from "@/hooks/use-mobile"
import { cn } from "@/lib/utils"
import { ResponsiveContainer as RContainer } from "@/components/responsive-container"

export default function SettingsPage() {
  const { t, formatCurrency, formatDateTime } = useI18n()
  const { isMobile, isTablet, isDesktop } = useResponsive()

  return (
    <RContainer fullWidth padding="md">
      <Tabs defaultValue="general" className="space-y-4 md:space-y-6">
        <TabsList className={cn(
          "w-full",
          isMobile
            ? "grid grid-cols-2 gap-1 h-auto p-1"
            : isTablet
            ? "grid grid-cols-3 gap-1"
            : "grid grid-cols-6"
        )}>
          <TabsTrigger
            value="general"
            className={cn(
              isMobile ? "text-xs px-2 py-2" : "text-sm"
            )}
          >
            {isMobile ? t("settings.general").slice(0, 8) : t("settings.general")}
          </TabsTrigger>
          <TabsTrigger
            value="account"
            className={cn(
              isMobile ? "text-xs px-2 py-2" : "text-sm"
            )}
          >
            {isMobile ? t("settings.account").slice(0, 8) : t("settings.account")}
          </TabsTrigger>
          <TabsTrigger
            value="team"
            className={cn(
              isMobile ? "text-xs px-2 py-2" : "text-sm"
            )}
          >
            {isMobile ? t("settings.team").slice(0, 8) : t("settings.team")}
          </TabsTrigger>
          <TabsTrigger
            value="billing"
            className={cn(
              isMobile ? "text-xs px-2 py-2" : "text-sm"
            )}
          >
            {isMobile ? t("settings.billing").slice(0, 8) : t("settings.billing")}
          </TabsTrigger>
          <TabsTrigger
            value="notifications"
            className={cn(
              isMobile ? "text-xs px-2 py-2" : "text-sm"
            )}
          >
            {isMobile ? "Notifs" : t("settings.notifications")}
          </TabsTrigger>
          <TabsTrigger
            value="i18n"
            className={cn(
              isMobile ? "text-xs px-2 py-2" : "text-sm"
            )}
          >
            {isMobile ? "Lang" : t("settings.language")}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="general">
          <Card>
            <CardHeader className={cn(isMobile ? "p-3" : "p-4 md:p-6")}>
              <CardTitle className={cn(
                isMobile ? "text-base" : "text-lg md:text-xl"
              )}>
                {t("settings.companyInformation")}
              </CardTitle>
              <CardDescription className={cn(
                isMobile ? "text-xs" : "text-sm"
              )}>
                {t("common.update")} {t("settings.companyInformation").toLowerCase()}
              </CardDescription>
            </CardHeader>
            <CardContent className={cn(
              "space-y-4 md:space-y-6",
              isMobile ? "p-3" : "p-4 md:p-6"
            )}>
              <div className={cn(
                "grid gap-4 md:gap-6",
                isMobile ? "grid-cols-1" : "grid-cols-1 md:grid-cols-2"
              )}>
                <div className="space-y-2">
                  <Label
                    htmlFor="companyName"
                    className={cn(isMobile ? "text-xs" : "text-sm")}
                  >
                    {t("settings.companyName")}
                  </Label>
                  <Input
                    id="companyName"
                    defaultValue="Acme Inc."
                    className={cn(isMobile ? "text-sm" : "")}
                  />
                </div>
                <div className="space-y-2">
                  <Label
                    htmlFor="taxId"
                    className={cn(isMobile ? "text-xs" : "text-sm")}
                  >
                    {t("settings.taxId")}
                  </Label>
                  <Input
                    id="taxId"
                    defaultValue="US123456789"
                    className={cn(isMobile ? "text-sm" : "")}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="address"
                  className={cn(isMobile ? "text-xs" : "text-sm")}
                >
                  {t("settings.address")}
                </Label>
                <Input
                  id="address"
                  defaultValue="123 Business Street"
                  className={cn(isMobile ? "text-sm" : "")}
                />
              </div>

              <div className={cn(
                "grid gap-4 md:gap-6",
                isMobile ? "grid-cols-1" : "grid-cols-1 md:grid-cols-3"
              )}>
                <div className="space-y-2">
                  <Label
                    htmlFor="city"
                    className={cn(isMobile ? "text-xs" : "text-sm")}
                  >
                    {t("settings.city")}
                  </Label>
                  <Input
                    id="city"
                    defaultValue="San Francisco"
                    className={cn(isMobile ? "text-sm" : "")}
                  />
                </div>
                <div className="space-y-2">
                  <Label
                    htmlFor="state"
                    className={cn(isMobile ? "text-xs" : "text-sm")}
                  >
                    {t("settings.state")}
                  </Label>
                  <Input
                    id="state"
                    defaultValue="California"
                    className={cn(isMobile ? "text-sm" : "")}
                  />
                </div>
                <div className="space-y-2">
                  <Label
                    htmlFor="zipCode"
                    className={cn(isMobile ? "text-xs" : "text-sm")}
                  >
                    {t("settings.zipCode")}
                  </Label>
                  <Input
                    id="zipCode"
                    defaultValue="94103"
                    className={cn(isMobile ? "text-sm" : "")}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="country"
                  className={cn(isMobile ? "text-xs" : "text-sm")}
                >
                  {t("settings.country")}
                </Label>
                <Input
                  id="country"
                  defaultValue="United States"
                  className={cn(isMobile ? "text-sm" : "")}
                />
              </div>

              <div className={cn(
                "grid gap-4 md:gap-6",
                isMobile ? "grid-cols-1" : "grid-cols-1 md:grid-cols-2"
              )}>
                <div className="space-y-2">
                  <Label
                    htmlFor="phone"
                    className={cn(isMobile ? "text-xs" : "text-sm")}
                  >
                    {t("settings.phone")}
                  </Label>
                  <Input
                    id="phone"
                    defaultValue="+1 (555) 123-4567"
                    className={cn(isMobile ? "text-sm" : "")}
                  />
                </div>
                <div className="space-y-2">
                  <Label
                    htmlFor="email"
                    className={cn(isMobile ? "text-xs" : "text-sm")}
                  >
                    {t("settings.email")}
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    defaultValue="contact@acmeinc.com"
                    className={cn(isMobile ? "text-sm" : "")}
                  />
                </div>
              </div>
            </CardContent>
            <CardFooter className={cn(isMobile ? "p-3" : "p-4 md:p-6")}>
              <Button
                size={isMobile ? "sm" : "default"}
                className={cn(
                  "touch-target",
                  isMobile ? "w-full" : ""
                )}
              >
                <Save className={cn("mr-2", isMobile ? "h-3 w-3" : "h-4 w-4")} />
                <span className={cn(isMobile ? "text-xs" : "")}>
                  {t("settings.saveChanges")}
                </span>
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

      <TabsContent value="account">
        <Card>
          <CardHeader>
            <CardTitle>Account Settings</CardTitle>
            <CardDescription>Manage your account information and security settings.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="h-20 w-20 rounded-full bg-gray-200 flex items-center justify-center">
                  <User className="h-10 w-10 text-gray-500" />
                </div>
                <Button size="sm" variant="outline" className="absolute -bottom-2 -right-2 rounded-full h-8 w-8 p-0">
                  <span className="sr-only">Change avatar</span>
                  <span className="text-xs">+</span>
                </Button>
              </div>
              <div>
                <h3 className="font-medium">Profile Picture</h3>
                <p className="text-sm text-muted-foreground">JPG, GIF or PNG. Max size 2MB.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="firstName">First Name</Label>
                <Input id="firstName" defaultValue="John" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name</Label>
                <Input id="lastName" defaultValue="Doe" />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input id="email" type="email" defaultValue="john.doe@example.com" />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="currentPassword">Current Password</Label>
                <Button variant="link" size="sm" className="h-auto p-0">
                  Forgot password?
                </Button>
              </div>
              <Input id="currentPassword" type="password" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="newPassword">New Password</Label>
                <Input id="newPassword" type="password" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm New Password</Label>
                <Input id="confirmPassword" type="password" />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium flex items-center">
                    <Lock className="h-4 w-4 mr-2" />
                    Two-Factor Authentication
                  </h3>
                  <p className="text-sm text-muted-foreground">Add an extra layer of security to your account.</p>
                </div>
                <Switch />
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button>
              <Save className="mr-2 h-4 w-4" />
              Save Changes
            </Button>
          </CardFooter>
        </Card>
      </TabsContent>

      <TabsContent value="team">
        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <CardTitle>Team Members</CardTitle>
                <CardDescription>Manage your team members and their access permissions.</CardDescription>
              </div>
              <Button>
                <Users className="mr-2 h-4 w-4" />
                Invite User
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="rounded-md border p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <User className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-medium">John Doe</h3>
                    <p className="text-sm text-muted-foreground">john.doe@example.com</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge>Admin</Badge>
                  <Button variant="outline" size="sm">
                    Manage
                  </Button>
                </div>
              </div>

              <div className="rounded-md border p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <User className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-medium">Jane Smith</h3>
                    <p className="text-sm text-muted-foreground">jane.smith@example.com</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline">Inventory Manager</Badge>
                  <Button variant="outline" size="sm">
                    Manage
                  </Button>
                </div>
              </div>

              <div className="rounded-md border p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <User className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-medium">Robert Johnson</h3>
                    <p className="text-sm text-muted-foreground">robert.johnson@example.com</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline">Sales Representative</Badge>
                  <Button variant="outline" size="sm">
                    Manage
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="billing">
        <Card>
          <CardHeader>
            <CardTitle>Billing Information</CardTitle>
            <CardDescription>Manage your subscription and payment methods.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h3 className="font-medium mb-2 flex items-center">
                <Building className="h-4 w-4 mr-2" />
                Current Plan
              </h3>
              <div className="rounded-md border p-4">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div>
                    <h4 className="font-semibold">Business Plan</h4>
                    <p className="text-sm text-muted-foreground">$49.99/month</p>
                  </div>
                  <Button variant="outline">Upgrade Plan</Button>
                </div>
                <div className="mt-4 pt-4 border-t">
                  <p className="text-sm">
                    Your next billing date is <strong>June 1, 2023</strong>
                  </p>
                </div>
              </div>
            </div>

            <div>
              <h3 className="font-medium mb-2 flex items-center">
                <CreditCard className="h-4 w-4 mr-2" />
                Payment Methods
              </h3>
              <div className="rounded-md border p-4">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded bg-gray-100 flex items-center justify-center">
                      <CreditCard className="h-5 w-5" />
                    </div>
                    <div>
                      <h4 className="font-medium">Visa ending in 4242</h4>
                      <p className="text-sm text-muted-foreground">Expires 04/2025</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      Edit
                    </Button>
                    <Button variant="outline" size="sm">
                      Remove
                    </Button>
                  </div>
                </div>
              </div>
              <Button variant="outline" className="mt-4">
                <CreditCard className="mr-2 h-4 w-4" />
                Add Payment Method
              </Button>
            </div>

            <div>
              <h3 className="font-medium mb-2">Billing History</h3>
              <div className="rounded-md border overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Description
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Amount
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Invoice
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    <tr>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">May 1, 2023</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">Business Plan Subscription</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">$49.99</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                          Paid
                        </Badge>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-right">
                        <Button variant="link" size="sm" className="h-auto p-0">
                          Download
                        </Button>
                      </td>
                    </tr>
                    <tr>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">Apr 1, 2023</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">Business Plan Subscription</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">$49.99</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                          Paid
                        </Badge>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-right">
                        <Button variant="link" size="sm" className="h-auto p-0">
                          Download
                        </Button>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="notifications">
        <Card>
          <CardHeader>
            <CardTitle>Notification Settings</CardTitle>
            <CardDescription>Configure how and when you receive notifications.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h3 className="font-medium mb-4 flex items-center">
                <Bell className="h-4 w-4 mr-2" />
                Email Notifications
              </h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Low Stock Alerts</h4>
                    <p className="text-sm text-muted-foreground">Receive alerts when products are running low</p>
                  </div>
                  <Switch defaultChecked />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Order Notifications</h4>
                    <p className="text-sm text-muted-foreground">Receive notifications for new orders</p>
                  </div>
                  <Switch defaultChecked />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Shipment Updates</h4>
                    <p className="text-sm text-muted-foreground">Get notified about shipment status changes</p>
                  </div>
                  <Switch defaultChecked />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Price Changes</h4>
                    <p className="text-sm text-muted-foreground">Alerts about supplier price changes</p>
                  </div>
                  <Switch />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">System Updates</h4>
                    <p className="text-sm text-muted-foreground">Notifications about system updates and maintenance</p>
                  </div>
                  <Switch defaultChecked />
                </div>
              </div>
            </div>

            <div>
              <h3 className="font-medium mb-4">In-App Notifications</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Dashboard Alerts</h4>
                    <p className="text-sm text-muted-foreground">Show alerts on the dashboard</p>
                  </div>
                  <Switch defaultChecked />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Real-time Updates</h4>
                    <p className="text-sm text-muted-foreground">Show real-time inventory updates</p>
                  </div>
                  <Switch defaultChecked />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Team Activity</h4>
                    <p className="text-sm text-muted-foreground">Notifications about team member actions</p>
                  </div>
                  <Switch />
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button>
              <Save className="mr-2 h-4 w-4" />
              Save Preferences
            </Button>
          </CardFooter>
        </Card>
      </TabsContent>

        <TabsContent value="i18n">
          <I18nSettings />
        </TabsContent>
      </Tabs>
    </RContainer>
  )
}
