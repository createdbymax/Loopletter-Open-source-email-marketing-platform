import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Heart, Mail, Clock, Users } from 'lucide-react';
export default function WelcomeSeriesPage() {
    return (<div className="space-y-8">
      <div>
        <h1 className="text-4xl font-bold tracking-tight">Welcome Series Automation</h1>
        <p className="text-xl text-muted-foreground mt-4">
          Create automated welcome sequences to introduce new fans to your music and story.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Mail className="h-4 w-4"/>
              Welcome Email
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Immediate thank you and introduction
            </p>
            <Badge variant="outline" className="mt-2">Immediate</Badge>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Heart className="h-4 w-4"/>
              Your Story
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Share your musical journey
            </p>
            <Badge variant="outline" className="mt-2">Day 2</Badge>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Clock className="h-4 w-4"/>
              Best Music
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Showcase your top tracks
            </p>
            <Badge variant="outline" className="mt-2">Day 5</Badge>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Users className="h-4 w-4"/>
              Community
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Connect on social media
            </p>
            <Badge variant="outline" className="mt-2">Day 12</Badge>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Welcome Series Best Practices</CardTitle>
          <CardDescription>
            Create an effective onboarding experience for new fans
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            A well-crafted welcome series introduces new subscribers to your music, 
            builds a personal connection, and sets expectations for future communications.
          </p>
        </CardContent>
      </Card>
    </div>);
}
