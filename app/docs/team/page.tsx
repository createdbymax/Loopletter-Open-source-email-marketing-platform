import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Users, Shield, UserPlus, Settings, Crown, Eye, Edit, Lightbulb } from 'lucide-react';
export default function TeamManagementPage() {
    return (<div className="space-y-8">
      <div>
        <h1 className="text-4xl font-bold tracking-tight">Team Management</h1>
        <p className="text-xl text-muted-foreground mt-4">
          Collaborate with your team members, managers, and label staff by giving them appropriate access to your email marketing campaigns.
        </p>
      </div>

      <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5"/>
            Why Use Team Management?
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <h3 className="font-medium mb-2">Collaborative Workflow</h3>
              <p className="text-sm text-muted-foreground">
                Work together on campaigns while maintaining control over who can access what features and data.
              </p>
            </div>
            <div>
              <h3 className="font-medium mb-2">Professional Management</h3>
              <p className="text-sm text-muted-foreground">
                Give your manager, label, or agency team appropriate access without sharing your main account credentials.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Crown className="h-4 w-4"/>
              Owner
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Full access to all features including billing, team management, and account settings.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Shield className="h-4 w-4"/>
              Admin
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Full access to campaigns and audience management, but cannot manage billing or account settings.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Edit className="h-4 w-4"/>
              Editor
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Can create and edit campaigns, manage audience, but cannot send emails or change settings.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Eye className="h-4 w-4"/>
              Viewer
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Read-only access to view campaigns, analytics, and audience data without making changes.
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>User Roles & Permissions</CardTitle>
          <CardDescription>
            Detailed breakdown of what each role can access and do
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2 font-medium">Feature</th>
                  <th className="text-center py-2 font-medium">Owner</th>
                  <th className="text-center py-2 font-medium">Admin</th>
                  <th className="text-center py-2 font-medium">Editor</th>
                  <th className="text-center py-2 font-medium">Viewer</th>
                </tr>
              </thead>
              <tbody className="space-y-2">
                <tr className="border-b">
                  <td className="py-2">Create campaigns</td>
                  <td className="text-center">✅</td>
                  <td className="text-center">✅</td>
                  <td className="text-center">✅</td>
                  <td className="text-center">❌</td>
                </tr>
                <tr className="border-b">
                  <td className="py-2">Send campaigns</td>
                  <td className="text-center">✅</td>
                  <td className="text-center">✅</td>
                  <td className="text-center">❌</td>
                  <td className="text-center">❌</td>
                </tr>
                <tr className="border-b">
                  <td className="py-2">View analytics</td>
                  <td className="text-center">✅</td>
                  <td className="text-center">✅</td>
                  <td className="text-center">✅</td>
                  <td className="text-center">✅</td>
                </tr>
                <tr className="border-b">
                  <td className="py-2">Manage audience</td>
                  <td className="text-center">✅</td>
                  <td className="text-center">✅</td>
                  <td className="text-center">✅</td>
                  <td className="text-center">❌</td>
                </tr>
                <tr className="border-b">
                  <td className="py-2">Create segments</td>
                  <td className="text-center">✅</td>
                  <td className="text-center">✅</td>
                  <td className="text-center">✅</td>
                  <td className="text-center">❌</td>
                </tr>
                <tr className="border-b">
                  <td className="py-2">Domain setup</td>
                  <td className="text-center">✅</td>
                  <td className="text-center">✅</td>
                  <td className="text-center">❌</td>
                  <td className="text-center">❌</td>
                </tr>
                <tr className="border-b">
                  <td className="py-2">Team management</td>
                  <td className="text-center">✅</td>
                  <td className="text-center">❌</td>
                  <td className="text-center">❌</td>
                  <td className="text-center">❌</td>
                </tr>
                <tr className="border-b">
                  <td className="py-2">Billing & subscription</td>
                  <td className="text-center">✅</td>
                  <td className="text-center">❌</td>
                  <td className="text-center">❌</td>
                  <td className="text-center">❌</td>
                </tr>
                <tr className="border-b">
                  <td className="py-2">Account settings</td>
                  <td className="text-center">✅</td>
                  <td className="text-center">❌</td>
                  <td className="text-center">❌</td>
                  <td className="text-center">❌</td>
                </tr>
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Adding Team Members</CardTitle>
          <CardDescription>
            Step-by-step guide to inviting people to your team
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <Badge variant="outline" className="mt-0.5">1</Badge>
              <div>
                <h3 className="font-medium">Navigate to Team Settings</h3>
                <p className="text-sm text-muted-foreground">
                  Go to <strong>Settings</strong> → <strong>Team Management</strong> → <strong>Invite Member</strong>
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <Badge variant="outline" className="mt-0.5">2</Badge>
              <div>
                <h3 className="font-medium">Enter Email Address</h3>
                <p className="text-sm text-muted-foreground">
                  Add the email address of the person you want to invite to your team
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <Badge variant="outline" className="mt-0.5">3</Badge>
              <div>
                <h3 className="font-medium">Select Role</h3>
                <p className="text-sm text-muted-foreground">
                  Choose the appropriate permission level based on their responsibilities
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <Badge variant="outline" className="mt-0.5">4</Badge>
              <div>
                <h3 className="font-medium">Send Invitation</h3>
                <p className="text-sm text-muted-foreground">
                  They'll receive an email invitation to join your Loopletter team
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <Badge variant="outline" className="mt-0.5">5</Badge>
              <div>
                <h3 className="font-medium">Invitation Acceptance</h3>
                <p className="text-sm text-muted-foreground">
                  Once they accept, they'll have access based on their assigned role
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Common Team Scenarios</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <div>
              <h3 className="font-medium mb-3">Solo Artist with Manager</h3>
              <div className="space-y-2 text-sm">
                <div><strong>Artist:</strong> Owner (full control)</div>
                <div><strong>Manager:</strong> Admin (can send campaigns, view analytics)</div>
                <div><strong>Assistant:</strong> Editor (can create content, manage audience)</div>
              </div>
              <p className="text-sm text-muted-foreground mt-2">
                Artist maintains billing control while manager handles day-to-day email marketing.
              </p>
            </div>

            <div>
              <h3 className="font-medium mb-3">Band with Label Support</h3>
              <div className="space-y-2 text-sm">
                <div><strong>Band Leader:</strong> Owner</div>
                <div><strong>Band Members:</strong> Editor (can contribute content)</div>
                <div><strong>Label Marketing:</strong> Admin (can execute campaigns)</div>
                <div><strong>Label Analytics:</strong> Viewer (can monitor performance)</div>
              </div>
              <p className="text-sm text-muted-foreground mt-2">
                Collaborative approach with band maintaining ownership and label providing expertise.
              </p>
            </div>

            <div>
              <h3 className="font-medium mb-3">Agency Management</h3>
              <div className="space-y-2 text-sm">
                <div><strong>Artist:</strong> Owner (oversight and approval)</div>
                <div><strong>Agency Lead:</strong> Admin (full campaign management)</div>
                <div><strong>Agency Team:</strong> Editor (content creation)</div>
                <div><strong>Artist Team:</strong> Viewer (monitoring)</div>
              </div>
              <p className="text-sm text-muted-foreground mt-2">
                Agency handles execution while artist maintains control and visibility.
              </p>
            </div>

            <div>
              <h3 className="font-medium mb-3">Independent Artist Collective</h3>
              <div className="space-y-2 text-sm">
                <div><strong>Primary Artist:</strong> Owner</div>
                <div><strong>Collaborating Artists:</strong> Editor (can create joint content)</div>
                <div><strong>Shared Manager:</strong> Admin (manages all campaigns)</div>
                <div><strong>Interns/Assistants:</strong> Viewer (learning and monitoring)</div>
              </div>
              <p className="text-sm text-muted-foreground mt-2">
                Collaborative environment for artists working together on projects.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Managing Team Members</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <div>
              <h3 className="font-medium mb-3">Changing Roles</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• Promote team members as responsibilities grow</li>
                <li>• Demote if access needs to be restricted</li>
                <li>• Changes take effect immediately</li>
                <li>• Team members are notified of role changes</li>
              </ul>
            </div>

            <div>
              <h3 className="font-medium mb-3">Removing Team Members</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• Remove access when team members leave</li>
                <li>• They lose access immediately</li>
                <li>• Their work and contributions remain</li>
                <li>• Can be re-invited later if needed</li>
              </ul>
            </div>
          </div>

          <div>
            <h3 className="font-medium mb-3">Activity Monitoring</h3>
            <p className="text-sm text-muted-foreground mb-3">
              Track what team members are doing in your account:
            </p>
            <ul className="space-y-1 text-sm text-muted-foreground">
              <li>• Campaign creation and editing</li>
              <li>• Email sends and scheduling</li>
              <li>• Audience management activities</li>
              <li>• Settings and configuration changes</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Security & Best Practices</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <div>
              <h3 className="font-medium mb-3">Access Control</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• Give minimum necessary permissions</li>
                <li>• Review team access regularly</li>
                <li>• Remove access when no longer needed</li>
                <li>• Use specific roles rather than broad access</li>
              </ul>
            </div>

            <div>
              <h3 className="font-medium mb-3">Communication</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• Clearly communicate roles and expectations</li>
                <li>• Set up approval workflows for sensitive actions</li>
                <li>• Regular team meetings about email strategy</li>
                <li>• Document processes and guidelines</li>
              </ul>
            </div>
          </div>

          <div>
            <h3 className="font-medium mb-3">Data Protection</h3>
            <div className="bg-muted p-4 rounded-md space-y-2 text-sm">
              <div><strong>Fan Data:</strong> All team members must respect fan privacy</div>
              <div><strong>Export Restrictions:</strong> Limit who can export audience data</div>
              <div><strong>Compliance:</strong> Ensure team understands GDPR/CAN-SPAM requirements</div>
              <div><strong>Confidentiality:</strong> Team members should sign NDAs for sensitive projects</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Collaboration Workflows</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h3 className="font-medium mb-3">Campaign Approval Process</h3>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <Badge variant="outline" className="mt-0.5">1</Badge>
                <div>
                  <h4 className="text-sm font-medium">Content Creation</h4>
                  <p className="text-sm text-muted-foreground">
                    Editor creates campaign content and saves as draft
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Badge variant="outline" className="mt-0.5">2</Badge>
                <div>
                  <h4 className="text-sm font-medium">Review & Feedback</h4>
                  <p className="text-sm text-muted-foreground">
                    Admin or Owner reviews content and provides feedback
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Badge variant="outline" className="mt-0.5">3</Badge>
                <div>
                  <h4 className="text-sm font-medium">Final Approval</h4>
                  <p className="text-sm text-muted-foreground">
                    Owner gives final approval for sending
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Badge variant="outline" className="mt-0.5">4</Badge>
                <div>
                  <h4 className="text-sm font-medium">Execution</h4>
                  <p className="text-sm text-muted-foreground">
                    Admin schedules and sends the approved campaign
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div>
            <h3 className="font-medium mb-3">Content Collaboration Tips</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>• Use clear naming conventions for campaigns</li>
              <li>• Add notes and comments for team communication</li>
              <li>• Create templates for consistent branding</li>
              <li>• Establish content guidelines and brand voice</li>
              <li>• Regular team training on email best practices</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      <Alert>
        <Lightbulb className="h-4 w-4"/>
        <AlertDescription>
          <strong>Pro Tip:</strong> Start with minimal permissions and gradually increase access as team members prove themselves. 
          It's easier to grant more access than to recover from security issues.
        </AlertDescription>
      </Alert>
    </div>);
}
