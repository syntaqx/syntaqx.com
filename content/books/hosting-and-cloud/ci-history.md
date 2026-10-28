+++
title = "From Tinderbox to Jenkins: How CI Began"
nav_title = "Tinderbox to Jenkins"
description = "Tinderbox, CruiseControl, TeamCity, Hudson and the Jenkins rename, Bamboo, Travis CI and hosted CI, then the code hosts absorbing it: dated to primary sources."
category = "Hosting & Cloud Industry"
order = 2142
part = "CI/CD Platforms"
tags = ["ci", "history", "jenkins", "travis-ci", "github-actions"]
+++

Continuous integration began as a practice and became an industry in three moves. First a team ran a machine that built the code after every check-in and showed who broke it. Then that machine became a product, open source or licensed, that every company installed on its own server. Then the server became a service, first from independent hosted CI companies with free plans for open source, and finally from the code hosts themselves, which folded CI into the repository and turned build minutes into a line on the same bill. Each move solved the previous one's cost and created a new one: the build server under a desk needed someone to maintain it, the installed server needed plugins and upgrades, and the hosted service needed somebody to pay for the minutes.

This chapter dates that history to its primary sources. It covers the practice's origin in Extreme Programming, Tinderbox at Netscape, Martin Fowler's article and CruiseControl, TeamCity and Bamboo, Hudson and the 2011 rename to Jenkins, Travis CI and the hosted era, GitLab CI, CircleCI and Drone, Bitbucket Pipelines, and then Azure Pipelines and GitHub Actions absorbing CI into the platforms. The rules of a good pipeline are the playbook's [CI & Continuous Deployment](/docs/delivery/ci-pipelines#fast); the vendors' business is [The CI/CD Platform Business](/books/hosting-and-cloud/ci-cd-platform-business); the machines that run the jobs are [Runners & Build Infrastructure](/books/hosting-and-cloud/runners-and-build-infrastructure).

## How the Providers Do It

The products in this history, by origin and fate, as of October 2026:

| Product | Origin | Model | Fate |
| --- | --- | --- | --- |
| **Tinderbox** | Netscape release engineering, April 1997 | Build machines reporting to a status page | Mozilla moved to TBPL and buildbot from September 2012; the Tinderbox server was powered off May 16, 2014 |
| **CruiseControl** | ThoughtWorks, release 1.0 in 2001 | Open-source build loop polling version control | Last release 2.8.4 in September 2010 |
| **TeamCity** | JetBrains, 1.0 on October 2, 2006 | Licensed server with build agents | Still sold by JetBrains |
| **Hudson, then Jenkins** | Kohsuke Kawaguchi at Sun, 2004; renamed Jenkins in January 2011 | Open-source server with plugins | Jenkins under the Continuous Delivery Foundation; CloudBees sells it commercially; Hudson went to Eclipse |
| **Bamboo** | Atlassian | Licensed server; Bamboo Cloud hosted | Bamboo Cloud discontinued January 31, 2017; Bamboo Data Center end of life scheduled for March 28, 2029 |
| **Travis CI** | Berlin, 2011 | Hosted CI, free for open source on travis-ci.org | Acquired by Idera in January 2019; travis-ci.org shut down May 31, 2021 |
| **CircleCI** | San Francisco, 2011 | Hosted CI, later with self-hosted runners | Independent, venture funded |
| **GitLab CI** | First version November 2012 | CI built into the code host, with runners | Part of GitLab since 8.0 (September 22, 2015) |
| **Bitbucket Pipelines** | Atlassian, beta May 2016, generally available October 25, 2016 | CI built into the code host | Atlassian's hosted CI |
| **Azure Pipelines** | Microsoft, September 10, 2018 | CI from the Azure DevOps suite, for any repository | Part of Azure DevOps |
| **GitHub Actions** | Announced October 16, 2018; CI/CD August 8, 2019; generally available November 13, 2019 | Workflows in the code host, hosted and self-hosted runners | 71 million jobs a day by GitHub's count (December 2025) |

Three patterns run through the table. **The shape never changed:** many agents doing the work, one coordinator showing the result per commit, from Tinderbox's build machines to every runner fleet today. **Ownership kept moving:** from a release engineering team to a consultancy's open-source project to vendors to foundations, and the most consequential event in the history was a trademark dispute, not a technical one. **The code host won:** the products that survived as hosted services are mostly the ones attached to where the code lives.

## The Practice Before the Product

Martin Fowler's history credits the practice to Kent Beck, who developed continuous integration as part of Extreme Programming in the 1990s; Grady Booch had used the phrase earlier, but only, in Fowler's words, as "an offhand description" in one sentence of his object-oriented design book. The problem was integration hell: developers working apart for weeks, then spending days merging. The practice was to integrate at least daily, with an automated build and tests that tell everyone at once whether the result works.

## Tinderbox: The Build Machine Becomes a Page

Netscape's release engineers began running what one of Mozilla's later release engineering directors calls "the world's first? second? continuous integration server" in April 1997 (he allows that SGI may have had something similar). Before it, release engineering gathered the previous day's check-ins at 10 a.m. and built by hand. Mozilla's newsletter of May 21, 1998 announced that Tinderbox "has become available": machines continually built Mozilla on several platforms and sent their logs to a server that showed build status, "making it evident who breaks the build with each checkin." Mozilla's project page described a fleet of dedicated build machines running compilations and automated tests, results viewed with a browser, and whoever checked in between the last good build and the broken one as the person who "broke the build."

What it solved was attribution: a broken build had a name attached within the hour. What it cost was a fleet of machines and the people to keep them building. Mozilla replaced it with TBPL and buildbot from September 2012 and powered off the Tinderbox server on May 16, 2014, about seventeen years after it started.

## Fowler and CruiseControl: The Practice Gets a Tool

Fowler's article "Continuous Integration" is dated September 10, 2000 in its revision log, was completely rewritten on May 1, 2006, and revised again on January 18, 2024 (its body says he first wrote it in 2001, a contradiction the log resolves). It credits CruiseControl with popularizing the practice. CruiseControl's own site says the original source code was contributed by ThoughtWorks; the SourceForge release folder for 1.0 is dated March 30, 2001 and the license reads "Copyright (c) 2001, ThoughtWorks, Inc." It was a loop: poll version control, build on change, publish results, notify. Its last release, 2.8.4, is dated September 16, 2010.

ThoughtWorks' commercial successor, Cruise, launched in 2008; its product manager Jez Humble told InfoQ that "we have used parts of the code in our new product," so the commercial line descends from the open-source one rather than starting fresh.

## TeamCity and Bamboo: The Licensed Server

JetBrains announced "JetBrains Team Server" on March 29, 2006, renamed it TeamCity on July 13, 2006, released a beta on July 28, 2006, and shipped TeamCity 1.0 on October 2, 2006, simultaneously with IntelliJ IDEA 6.0, followed by 1.2 on January 15, 2007. The launch release pitched it as IDE independent, for .NET and Java, with Ant, Maven, NAnt and MSBuild builds, JUnit and NUnit tests, and Perforce, Subversion and CVS; its distinctive feature was Remote Run, building a developer's change on the server before it was committed. The licensed CI server was the model: a company bought a server license, ran build agents on its own machines, and paid more for more agents.

Atlassian's Bamboo followed the same model and added a hosted version, Bamboo Cloud. At AtlasCamp in May 2016 Atlassian announced the beta of Bitbucket Pipelines and the end of Bamboo Cloud, discontinued January 31, 2017. Its product manager Sten Pittet explained that "we realized that we would not be able to deliver the experience and the quality of service that our customers need," and added in Atlassian's community that Pipelines "is in early stages and has gaps compared to Bamboo Cloud but we can move faster to fill those." Bitbucket Pipelines became generally available on October 25, 2016. Atlassian has scheduled Bamboo Data Center's end of life for March 28, 2029 and published a Bamboo-to-Pipelines migration tool in beta in March 2026.

## Hudson and the Jenkins Rename

Kohsuke Kawaguchi was a Java programmer at Sun Microsystems in 2004 who kept getting calls about builds his changes had broken, and, as he told The Register, "felt like I had to write a program." Hudson was that program: a build server with a plugin interface, which turned out to be the reason it won, since every tool, test framework and version control system could integrate without waiting for the core. The oldest commit in today's Jenkins repository is a Subversion import of November 5, 2006, so the code's history predates even that.

Oracle acquired Sun, and with it the Hudson name. After problems migrating the project's infrastructure on java.net, the core developers, with Kawaguchi and Sacha Labourey of CloudBees, negotiated with Oracle; they agreed on infrastructure, code review and governance but not on the name. The project's post of January 11, 2011 explained that Oracle had filed trademark applications in the EU and the US based on the software's creation at Sun and could revoke the project's use of the name "at any time," which the authors called "a sword of Damocles." They proposed renaming the project Jenkins, with Kawaguchi registering the mark and transferring it to the Software Freedom Conservancy, and moving off Oracle-hosted infrastructure, framed as "a rename rather than a fork." The community vote, announced January 29, 2011, counted 214 eligible votes for the rename and 14 for the status quo.

Oracle kept Hudson. Its maintainer said Oracle and "some of our partners and current Hudson community members" would continue the project; in May 2011 Oracle proposed moving Hudson's code, domain and trademark to the Eclipse Foundation under the Eclipse Public License, and Eclipse announced Hudson 3.0 on January 23, 2013. The users went with Jenkins. Kawaguchi founded InfraDNA to support Hudson in 2011; CloudBees acquired it later that year and he became its CTO, which made CloudBees the commercial Jenkins company.

The lesson providers took from it is that an open-source tool's name is property, and the governance of a widely used project needs a neutral owner. Jenkins later became a founding project of the Continuous Delivery Foundation, launched by the Linux Foundation on March 12, 2019 with Jenkins, Jenkins X, Spinnaker and Tekton.

## The Hosted Era: Travis CI, CircleCI and GitLab CI

Hosted CI started with open source. Travis CI began in February 2011 as "a little side project" in Berlin and offered free builds for public repositories on travis-ci.org, with private repositories on travis-ci.com. CircleCI was founded in San Francisco the same year.

Travis's arc is the hosted model's economics in public. Idera acquired it on January 23, 2019, promising to keep the free open-source service and the MIT license; the acquisition post counted more than 700,000 users. On November 2, 2020 Travis moved to credits charged per started build minute (Linux 10 credits, Windows 20, macOS 50), with open-source minutes "allotted case by case" on request. travis-ci.org, scheduled in late 2020 to go read-only, was [shut down](/books/hosting-and-cloud/migrations-and-end-of-life#the-kinds-of-ending) on May 31, 2021 by Travis's own announcement, with its build history kept read-only. Open-source maintainers moved: one moved about 120 repositories to GitHub Actions; curl, ineligible as a sponsored project once its credits ran out, moved its jobs to Zuul CI and CircleCI.

GitLab took the other path, building CI into the code host. GitLab's first commit is dated October 8, 2011, and its co-founder Dmitriy Zaporozhets made the first version of GitLab CI in November 2012. Kamil Trzciński's GitLab Runner, written in Go, was tagged v0.1.0 as its "Initial public release" on January 27, 2015, and GitLab 8.0 on September 22, 2015 shipped "with new looks and integrated CI." Drone, created by Brad Rydzewski, ran every step in a container from the start; Harness acquired it on August 5, 2020 ([The CI/CD Platform Business](/books/hosting-and-cloud/ci-cd-platform-business)).

## The Clouds and the Code Hosts Absorb It

The clouds offered build services first as parts of their deployment suites. AWS announced CodeDeploy, CodePipeline and CodeCommit at re:Invent on November 12, 2014, with CodeDeploy available that day and the others in 2015, and announced CodeBuild on December 1, 2016, running each build in a fresh, isolated, container-based environment, billed by the minute. Google's Container Builder reached general availability in March 2017 with 120 free build-minutes a day and was renamed Cloud Build on July 24, 2018.

Then the code hosts made CI a feature. Microsoft launched Azure Pipelines on September 10, 2018, when VSTS was rebranded Azure DevOps, with unlimited minutes and 10 free parallel jobs for every open-source project and hosted Linux, macOS and Windows agents. GitHub announced Actions at Universe on October 16, 2018 as workflow automation in beta, added CI/CD on August 8, 2019, and made it generally available on November 13, 2019, with Linux, macOS and Windows runners, containers or VMs, free for public repositories, and self-hosted runners free.

What the code hosts solved was integration: the build configuration, the runner, the status check, the secrets and the permissions all live where the code does, and the minutes appear on a bill the customer already pays. What it cost the independents was their reason to exist for small projects; the survivors sell speed, scale, hybrid control of the machines, or a place in an enterprise toolchain.

## The Alternatives

| Approach | Example | Strengths | Failure modes | Licensing and ownership | Who uses it |
| --- | --- | --- | --- | --- | --- |
| **Self-run open-source server** | Jenkins | Any workflow through plugins; runs anywhere; no per-minute cost | Plugin sprawl and upgrade risk; the server is a production system to patch | Open source under the Continuous Delivery Foundation; CloudBees sells it commercially | Enterprises with on-premises estates |
| **Licensed server** | TeamCity, Bamboo Data Center | Vendor support; mature agent model | License cost; vendor end-of-life decisions | Commercial (JetBrains, Atlassian) | Companies standardized on that vendor |
| **Independent hosted CI** | CircleCI, Travis CI, Buildkite | Speed and features as the product; works with several code hosts | Another vendor, bill and credential store; pricing changes | Commercial SaaS, some with self-hosted agents | Teams that outgrow or avoid the code host's CI |
| **Code-host CI** | GitHub Actions, GitLab CI, Bitbucket Pipelines, Azure Pipelines | Everything in one place; free tiers for open source | Lock-in to the host; one vendor's outage stops code and CI | Commercial, with GitLab's runner open source | Most new projects |
| **Cloud build services** | AWS CodeBuild, Google Cloud Build | Same IAM and network as the deploy target | Thin workflow features; per-cloud | Commercial, metered | Teams deploying into one cloud |

## My Default

My default is the Actions workflow format, not necessarily GitHub's CI service. The history shows that integration with the repository is what users value and what lasted, and also that hosted CI products end or reprice on someone else's schedule (Bamboo Cloud, travis-ci.org); a workflow format that more than one orchestrator reads is the part of that integration I can take with me, since Gitea Actions and Forgejo Actions both run GitHub-Actions-style workflow files, with documented gaps. In practice I start on GitHub Actions with its hosted runners, move to my own runners on GitHub's orchestrator when minutes cost too much, and keep a compatible orchestrator as the exit ([The CI/CD Platform Business](/books/hosting-and-cloud/ci-cd-platform-business#my-default) has the triggers; [Runners & Build Infrastructure](/books/hosting-and-cloud/runners-and-build-infrastructure#my-default) has the gaps). I'd run Jenkins only to keep an existing estate working, and I'd plan its migration rather than its growth. What would change this: a codebase or regulatory boundary that rules out a hosted control plane, which is the case for a self-run server, or a build so large that remote execution, not a CI product, is the real need.

## How to Build It

This chapter adds no tables. Its history is why [the core data model](/books/hosting-and-cloud/hosting-and-cloud-business#the-core-data-model) has a `ci_pipeline` resource kind with usage meters rather than a CI server as a resource: the market moved from selling servers to selling minutes. The pipeline and its meters are [The CI/CD Platform Business](/books/hosting-and-cloud/ci-cd-platform-business#how-to-build-it); runners and runs are [Runners & Build Infrastructure](/books/hosting-and-cloud/runners-and-build-infrastructure#how-to-build-it).

## What This Means for the System You Build

- **Keep the Tinderbox shape:** many agents, one coordinator, a result per commit with a name attached.
- **Put the build configuration in the repository,** where review and history already are.
- **Report status back to the pull request,** because that is where people decide.
- **Treat an open-source tool's governance and trademark as a dependency,** as Hudson's users learned.
- **Price open-source free tiers as a budget,** with a plan for when it ends, as travis-ci.org showed.

## References

**History and announcements**

- [Martin Fowler: Continuous Integration](https://martinfowler.com/articles/continuousIntegration.html), Kent Beck and XP, Booch's phrase, the revision log dates, CruiseControl's role
- [John O'Duinn: Farewell to Tinderbox](https://oduinn.com/2014/06/04/farewell-to-tinderbox/), April 1997 start, the manual build before it, TBPL and buildbot from September 2012, power-off on May 16, 2014
- [Mozilla: Tinderbox project page (archive)](https://www-archive.mozilla.org/projects/tinderbox/), the build fleet, browser results and who "broke the build"
- [LWN: Mozilla newsletter, May 21, 1998](https://lwn.net/1998/0528/a/moznews.html), Tinderbox becoming available
- [CruiseControl](https://cruisecontrol.sourceforge.net/), the source contributed by ThoughtWorks
- [SourceForge: CruiseControl release folders (archived)](http://web.archive.org/web/20110427162824/http://sourceforge.net:80/projects/cruisecontrol/files/CruiseControl/), 1.0 dated March 30, 2001 and 2.8.4 dated September 16, 2010
- [CruiseControl: License (archived)](http://web.archive.org/web/20120110184252/http://cruisecontrol.sourceforge.net/license.html), copyright 2001 ThoughtWorks
- [InfoQ: ThoughtWorks releases Cruise](https://www.infoq.com/news/2008/07/Cruise-Released/), July 28, 2008, Humble on reusing CruiseControl code
- [JetBrains: TeamCity 1.0 press release (archived)](http://web.archive.org/web/20220705183713/https://blog.jetbrains.com/blog/2006/10/02/pr_021006tc/), October 2, 2006, platforms, build tools, version control and Remote Run
- [JetBrains: IntelliJ IDEA 6.0 and TeamCity 1.0 beta](https://blog.jetbrains.com/idea/2006/07/intellij-idea-60-teamcity-10-beta-release/), the July 2006 beta
- [JetBrains: TeamCity blog launched](https://blog.jetbrains.com/teamcity/2007/04/jetbrains-teamcity-blog-launched/), the Team Server announcement, rename, beta, 1.0 and 1.2 dates
- [The Register: Jenkins creator interview](https://www.theregister.com/2018/11/09/jenkins_interview/), Hudson's start at Sun in 2004, InfraDNA and CloudBees
- [Jenkins: Hudson's future](https://www.jenkins.io/blog/2011/01/11/hudsons-future/), January 11, 2011, the trademark dispute and the rename proposal
- [Jenkins: Jenkins!](https://www.jenkins.io/blog/2011/01/29/jenkins/), January 29, 2011, the 214 to 14 vote
- [The Register: Oracle keeps Hudson](https://www.theregister.com/2011/02/01/oracle_hudson_fork/), February 1, 2011, Oracle's statement
- [SD Times: Oracle responds to the Hudson/Jenkins fork](https://sdtimes.com/hudson/oracle-responds-to-hudsonjenkins-fork), governance, release process and licensing
- [InfoQ: Oracle proposes Hudson to Eclipse](http://www.infoq.com/news/2011/05/eclipse-hudson), May 2011
- [Eclipse Foundation: Hudson 3.0](https://eclipse.org/org/press-release/20130123_hudson3.php), January 23, 2013
- [Linux Foundation: Continuous Delivery Foundation launch](https://www.linuxfoundation.org/press-release/the-linux-foundation-announces-new-foundation-to-support-continuous-delivery-collaboration/), March 12, 2019 and its first projects
- [SD Times: AtlasCamp 2016 introduces Bitbucket Pipelines](https://sdtimes.com/atlascamp-2016-introduces-bitbucket-pipelines-jira-ios/), the Pipelines beta and Bamboo Cloud's end
- [Atlassian Community: Bamboo Cloud end of life](https://community.atlassian.com/t5/Questions/Bamboo-Cloud-end-of-life/qaq-p/450934), Pittet's explanation and the January 31, 2017 date
- [Bitbucket: Bitbucket Pipelines is now generally available (archived)](http://web.archive.org/web/20201108103346/https://bitbucket.org/blog/bitbucket-pipelines-now-generally-available), October 25, 2016
- [Atlassian: Introducing the Bamboo to Bitbucket Pipelines migration tool](https://www.atlassian.com/blog/bamboo/introducing-bamboo-bitbucket-pipelines-migration-tool), the Data Center end-of-life date and the beta tool
- [RubyKaigi 2014: Josh Kalderimis](https://rubykaigi.org/2014/presentation/S-JoshKalderimis), Travis CI's start as a side project in February 2011
- [Travis CI: About us](https://www.travis-ci.com/about-us/), founded in Berlin in 2011
- [Travis CI: Travis CI joins Idera](https://www.travis-ci.com/blog/2019-01-23-travis-ci-joins-idera-inc/), January 23, 2019, users and the open-source commitment
- [Travis CI: New billing](https://www.travis-ci.com/blog/2020-11-02-travis-ci-new-billing/), November 2, 2020, credits per minute by OS and open-source minutes on request
- [Travis CI: travis-ci.org shutdown](https://www.travis-ci.com/blog/2021-05-07-orgshutdown/), May 31, 2021
- [Jeff Geerling: Travis CI's new pricing plan](https://www.jeffgeerling.com/blog/2020/travis-cis-new-pricing-plan-threw-wrench-my-open-source-works/), the read-only plan and the move to GitHub Actions
- [Daniel Stenberg: Bye bye Travis CI](https://daniel.haxx.se/blog/2021/06/14/bye-bye-travis-ci/), curl's move to Zuul CI and CircleCI
- [CircleCI: About](https://circleci.com/about/), founded in 2011 in San Francisco
- [GitLab Handbook: History](https://handbook.gitlab.com/handbook/company/history/), the first commit and the first GitLab CI in November 2012
- [GitLab Runner: Changelog](https://gitlab.com/gitlab-org/gitlab-runner/-/raw/main/CHANGELOG.md), the initial public release
- [GitLab Runner: Tags](https://gitlab.com/api/v4/projects/gitlab-org%2Fgitlab-runner/repository/tags), v0.1.0 on January 27, 2015
- [GitLab: GitLab 8.0 released (archived)](http://web.archive.org/web/2016/https://about.gitlab.com/2015/09/22/gitlab-8-0-released/), September 22, 2015, integrated CI
- [Amazon: AWS announces application lifecycle management services](https://press.aboutamazon.com/2014/11/amazon-web-services-announces-new-application-lifecycle-management-services), November 12, 2014
- [AWS News Blog: AWS CodeBuild](https://aws.amazon.com/blogs/aws/aws-codebuild-fully-managed-build-service/), December 1, 2016, fresh container per build and per-minute billing
- [The Register: Google Container Builder](https://www.theregister.com/2017/03/07/google_cloud_container_builder/), general availability and free build-minutes, March 2017
- [Google Cloud: Cloud Build release notes](https://docs.cloud.google.com/build/docs/release-notes), Container Builder renamed Cloud Build, July 24, 2018
- [Microsoft Azure: Announcing Azure Pipelines](https://azure.microsoft.com/en-us/blog/announcing-azure-pipelines-with-unlimited-ci-cd-minutes-for-open-source/), September 10, 2018, open-source minutes and parallel jobs
- [GitHub: Action demos](https://github.blog/news-insights/product-news/action-demos/), the Universe announcement of October 16, 2018
- [GitHub: GitHub Actions now supports CI/CD](https://github.blog/news-insights/product-news/github-actions-now-supports-ci-cd/), August 8, 2019, and general availability on November 13, 2019
- [GitHub: Let's talk about GitHub Actions](https://github.blog/news-insights/product-news/lets-talk-about-github-actions/), December 11, 2025, 71 million jobs a day
- [Gitea Docs: Compared to GitHub Actions](https://docs.gitea.com/usage/actions/comparison), Gitea Actions running GitHub-style workflows, with its differences
- [Forgejo Docs: GitHub Actions](https://forgejo.org/docs/latest/user/actions/github-actions/), Forgejo Actions' relationship to GitHub Actions and its known differences
- [Harness: Harness acquires Drone.io](https://harness.io/press-and-news/harness-acquires-drone-io-for-open-source-containerized-continuous-integration), August 5, 2020
