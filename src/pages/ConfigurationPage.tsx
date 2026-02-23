import { Text, IconV2 } from '@harnessio/ui/components'
import { Link } from 'react-router-dom'
import { Nav2 } from '../components/Nav2'

const configLinks = [
  { path: '/module/sei/configuration/org-tree', title: 'Org Trees', description: 'Manage organization tree structures and profile mappings' },
  { path: '/module/sei/configuration/teams', title: 'Teams', description: 'Configure team definitions and member assignments' },
  { path: '/module/sei/configuration/project', title: 'Project', description: 'Project-level settings and configuration' },
  { path: '/module/sei/configuration/integration', title: 'Integrations', description: 'Manage integrations with Jira, GitHub, Harness, and other tools' },
  { path: '/module/sei/configuration/profile/efficiency', title: 'Efficiency Profile', description: 'Configure metrics, weights, and settings for efficiency scoring' },
]

export function ConfigurationPage() {
  return (
    <Nav2 activeSection="configuration">
      <div className="flex flex-1 flex-col gap-5 overflow-auto px-5 pb-5 pt-6">
        <div>
          <Text as="h1" variant="heading-hero" color="foreground-1">Configuration</Text>
          <Text as="p" variant="body-normal" color="foreground-3" className="mt-1">
            Manage org trees, teams, projects, integrations, and profiles.
          </Text>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {configLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className="rounded-cn-2 border border-borders-2 bg-white p-4 no-underline transition-colors hover:border-borders-3"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-cn-2">
                  <IconV2 name={'settings' as never} size="sm" className="text-foreground-2" />
                </div>
                <div>
                  <Text variant="body-strong" color="foreground-1">{link.title}</Text>
                  <Text variant="caption-normal" color="foreground-3">{link.description}</Text>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </Nav2>
  )
}
