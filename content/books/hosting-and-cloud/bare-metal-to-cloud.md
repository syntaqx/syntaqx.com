+++
title = "From Bare Metal to Cloud: The Timeline"
nav_title = "Bare Metal to Cloud"
description = "Dated eras of hosting from colocation to virtualization, cloud, containers, serverless and back to hybrid, with deployment and IaC milestones."
category = "Hosting & Cloud Industry"
order = 2104
part = "The Business"
tags = ["history", "virtualization", "cloud", "containers", "infrastructure-as-code"]
+++

Hosting has been reinvented roughly every seven years, and each reinvention solved the last one's most expensive problem while creating a new one. Racking your own server meant waiting weeks for hardware; renting a dedicated server meant one customer per box; virtualization packed many customers onto one box but made each one a whole operating system to patch; the cloud made machines appear in a minute but billed every second of them; containers made the application the unit instead of the machine but needed a scheduler; functions removed the server from the customer's view and charged per request; and the bill for all of it sent some companies back to owning hardware, now run with the cloud's tools. Deployment and infrastructure as code moved in step: from copying files to a host, to scripting the copy, to converging servers on a declared state, to baking images, to declaring the whole estate in code.

The same path shows up at the scale of one person. A server in a closet at home becomes a quarter rack in colocation when the upload link or the power isn't enough, then capacity in a cloud when the hardware isn't worth owning, then a hybrid of the three. The eras below are the industry's version of that path. Every milestone is dated to its original paper, announcement, release or filing; the chapters that tell each layer in full are named in [The Map](#the-map), and the business they produced is in [The Provider Landscape](/books/hosting-and-cloud/provider-landscape).

## How the Providers Do It

No provider lived through all the eras in one form, and the ones that survived changed product under the same name. A few trajectories, from their filings and announcements:

| Provider | Started as | Became |
| --- | --- | --- |
| Rackspace | Operations began in 1998 as a limited partnership; NYSE listing on August 8, 2008 | A managed services company across other providers' clouds |
| Equinix | Incorporated June 22, 1998 to run neutral interconnection buildings | 280 data centers in 77 markets in 2025 |
| Amazon Web Services | S3 on March 13, 2006 and EC2 in beta on August 25, 2006, running on Xen | The largest cloud, now on its own Nitro hypervisor and hardware (Sandboxes & MicroVMs) |
| Heroku | A git-push platform; the Cedar process model announced June 20, 2011 | Free plans ended November 28, 2022; a "sustaining engineering model" from February 6, 2026 |
| ZEIT, renamed Vercel | Immutable deploy URLs; renamed April 21, 2020 | A frontend cloud on AWS regions |
| VMware | Incorporated 1998, first product shipped 1999 | Acquired by Broadcom, completed November 22, 2023 |

## Era 1: Files on Someone Else's Server (to the early 2000s)

The first hosting businesses sold what a company couldn't build alone: power, cooling, physical security and carrier density in one building. Colocation rented the space; dedicated hosting rented the machine in it. Equinix was incorporated on June 22, 1998 to run neutral buildings where networks meet, and Rackspace's operations began the same year as a limited partnership renting managed servers. The Uptime Institute's tiers, still the vocabulary of the industry, define the redundancy a facility sells, with Tier III as "concurrently maintainable."

Getting code onto those machines meant copying files. FTP, standardized in RFC 959 in October 1985, sent credentials and data in the clear. Andrew Tridgell and Paul Mackerras's rsync algorithm (an ANU technical report, 1996) sent only the changed blocks, which made mirroring a build to many servers practical over slow links. Isolation between customers on one shared server was the Unix process model and its file permissions, and the oldest container, `chroot`, appeared in Version 7 AT&T UNIX; FreeBSD 4.0 added jails, described by Poul-Henning Kamp and Robert Watson in "Jails: Confining the omnipotent root" (2000), explicitly motivated by hosting.

Configuration management began here too. CFEngine, which Mark Burgess began in 1993, converged many machines on a declared state instead of hand-editing each one.

**What it solved:** a server without a building. **What it cost:** weeks to provision, one customer per machine, and every change made by hand or by script on a live server.

## Era 2: Many Customers per Machine (1998 to 2008)

Virtualization made the machine divisible. VMware was incorporated in 1998 and shipped its first product in 1999; Carl Waldspurger's "Memory Resource Management in VMware ESX Server" (OSDI, December 2002) described the ballooning and page sharing that let a host promise guests more memory than it had, which is what makes virtual machine density pay. Xen, published at SOSP in October 2003 by Barham and colleagues at Cambridge, used paravirtualization to avoid the cost of binary translation and targeted "hosting up to 100 virtual machine instances simultaneously on a modern server" at an overhead of "at most a few percent."

Two branches of the virtual private server grew from this. One shared a kernel: Virtuozzo for Linux was released in January 2002, and OpenVZ released its core under the GPL in 2005, which is why many early VPS plans were containers by another name. The other gave each customer a kernel: Intel shipped the first hardware virtualization support for desktop PCs in the Pentium 4 662 and 672 on November 14, 2005, and KVM, which needs those extensions, was merged into Linux 2.6.20, released February 5, 2007, making Linux itself a hypervisor. Solaris Zones (Price and Tucker, LISA 2004) gave Solaris the shared-kernel model.

Configuration management matured into a product category. Luke Kanies prototyped Puppet in the summer of 2004 and worked on it full time from February 2005: agents send facts, a server compiles a catalog, and the agent applies it. On the deploy side, Jamis Buck's SwitchTower, later renamed Capistrano, was already in use for automated deployment by November 2005: scripted SSH to many servers at once.

**What it solved:** one machine, many customers, each with root. **What it cost:** a whole operating system per customer to patch, noisy neighbors on shared kernels, and hypervisor licenses for anyone not on Xen or KVM.

## Era 3: Machines by the Hour (2006 to 2012)

The cloud made the virtual machine an API call. AWS announced Amazon S3, "storage for the Internet," on March 13, 2006, and Amazon EC2 in beta on August 25, 2006: $0.10 per instance-hour for the equivalent of a 1.7 GHz Xeon with 1.75 GB of memory and 160 GB of disk, up to 20 instances per account, running on Xen. Google App Engine followed as a preview on April 7, 2008, taking code rather than machines, free up to 500 MB of storage and about 5 million page views a month for its first 10,000 developers. Microsoft began charging for Windows Azure on February 1, 2010.

The kernel features containers would need landed in this era. Linux 2.6.24, released January 24, 2008, merged control groups and added PID namespaces and basic network namespaces, the pieces OpenVZ and Linux-VServer had carried as out-of-tree patches.

Infrastructure as code came in waves. Chef's first public release was on January 16, 2009; AWS CloudFormation, announced February 25, 2011, declared a stack of AWS resources in a template and created them in order at no extra charge. Thomas Hatch's first commit to Salt is dated February 20, 2011, and Michael DeHaan's first commit to Ansible, agentless over SSH, February 23, 2012. Heroku's "The New Heroku (Part 1 of 4): The Process Model & Procfile," on June 20, 2011, made deployment a `git push` and the process the unit of scale; Adam Wiggins's twelve-factor app distilled the contract between such a platform and the code it runs.

**What it solved:** capacity in minutes without a contract. **What it cost:** a bill by the hour that nobody had to approve, the provider's lock-in in every API, and servers that still drifted after launch.

## Era 4: The Application Is the Unit (2013 to 2016)

Docker didn't add isolation (it used the same kernel features as LXC) but the image: a layered filesystem built from a file, pushed to a registry, pulled anywhere. Its first tag, `v0.1.0`, is dated March 26, 2013, and `v1.0.0` June 9, 2014. The Open Container Initiative launched on June 22, 2015 under the Linux Foundation to standardize the image and runtime, so the container stopped being one company's format.

Images changed how servers were built. Mitchell Hashimoto announced Packer on June 28, 2013 to build machine images for several platforms from one template, the practice that became golden images and immutable infrastructure. He announced Terraform on July 28, 2014 to declare infrastructure across providers with a plan before apply.

Running containers at scale needed a scheduler. Google's Kubernetes was announced on June 10, 2014, with Eric Brewer saying Google launches over 2 billion containers a week; Kubernetes 1.0 was released on July 21, 2015, alongside the formation of the Cloud Native Computing Foundation. Google described its internal predecessor in "Large-scale cluster management at Google with Borg" (EuroSys 2015). AWS previewed its EC2 Container Service on November 13, 2014, and HashiCorp announced Nomad on September 28, 2015.

Deployment became a pipeline with a preview. Netlify introduced Deploy Previews on July 20, 2016, deploying every pull request to its own URL before merge.

**What it solved:** build once, run anywhere, and pack many applications densely on a cluster. **What it cost:** a scheduler, a registry and a network overlay to operate, and a container boundary that was still a shared kernel.

## Era 5: No Server in Sight (2014 to 2020)

AWS Lambda, previewed on November 13, 2014, ran a function on an event and billed compute "in units of 100 milliseconds," with a timeout of up to 60 seconds. Cloudflare Workers, announced September 29, 2017, ran JavaScript in V8 isolates at the edge instead of in containers. WASI, announced by Mozilla on March 27, 2019, gave WebAssembly a system interface outside the browser.

Serverless needed stronger walls at lower cost than one VM per customer. Google open-sourced gVisor, a user-space kernel that intercepts system calls, on May 2, 2018. AWS announced Firecracker on November 26, 2018, launching microVMs "in as little as 125 ms" with about 5 MiB of memory each; the paper at NSDI in February 2020 described running Lambda and Fargate on it.

Hosted CI made the build server a service. GitHub announced CI/CD in GitHub Actions on August 8, 2019, free for public repositories. ZEIT, whose deploys each had a permanent URL with a domain aliased to one, renamed itself Vercel on April 21, 2020. GitOps, a reconciler in the cluster pulling desired state from Git, became a graduated CNCF practice when Argo graduated on December 6, 2022.

**What it solved:** paying only for work done, and isolating strangers' code per request. **What it cost:** cold starts, execution limits, a programming model per platform, and bills that scale with traffic nobody controls.

## Era 6: Back Toward Owning (2018 to Now)

The clouds moved their control planes into customers' buildings. Google announced Anthos, renamed from Cloud Services Platform, at Next on April 9, 2019; Microsoft previewed Azure Arc on November 4, 2019 to manage servers and clusters anywhere from Azure; AWS Outposts became generally available on December 3, 2019 as AWS-run racks in the customer's data center; Azure Stack HCI is now part of Azure Local. Oxide announced general availability of its rack-scale "cloud computer" for sale, not rent, on October 26, 2023.

Some companies left. Dropbox's S-1 (February 2018) attributed a $39.5 million net decrease in infrastructure costs in 2016 and a further $35.1 million in 2017 to moving user data off third-party infrastructure. 37signals announced it was leaving the cloud on October 19, 2022, projected about $1.5 million a year of savings on February 21, 2023 against a 2022 cloud bill of $3.2 million, and reported on October 17, 2024 that its cloud bill had fallen from $3.2 million to a $1.3 million run rate.

The tools' ownership changed under their users. HashiCorp moved future releases from MPL 2.0 to the Business Source License on August 10, 2023, and the OpenTofu fork reached its first stable release, 1.6.0, on January 10, 2024. Broadcom completed its acquisition of VMware on November 22, 2023. Heroku ended free plans on November 28, 2022 and moved to a sustaining engineering model on February 6, 2026.

**What it solved:** steady workloads at owned-hardware cost, and residency where the law requires it. **What it cost:** an operations team again, capital, and two or three control planes to keep consistent.

## The Map

Each era is told in full by the chapters below; the business and law that followed are in the later parts.

| Era | Chapters that tell it |
| --- | --- |
| 1. Files on someone else's server | The Data Center & Colocation; Dedicated Servers & Bare Metal; Data Center Networking; Shared Hosting Isolation; How Code Got to Servers; Convergence: CFEngine to Puppet |
| 2. Many customers per machine | Virtualization & the VPS; Shared Hosting Isolation; From chroot to Containers; Convergence: CFEngine to Puppet |
| 3. Machines by the hour | Regions, Zones, Cells & Quotas; Storage: Block, File & Object; Managed Databases; Chef; Push & Events: Ansible and Salt; Platforms Take Over the Deploy; PaaS & Frontend Clouds |
| 4. The application is the unit | From chroot to Containers; Schedulers: Borg to Kubernetes; the Kubernetes part (Kubernetes Architecture through Distributions & Alternatives); Baking Images: Packer; Provisioning: Terraform, OpenTofu & the Alternatives; Artifacts & Registries |
| 5. No server in sight | Sandboxes & MicroVMs; Functions, Isolates & Edge Compute; Serverless & Edge Databases; Managed Queues & Streaming; the CI/CD Platforms part (From Tinderbox to Jenkins: How CI Began through Pipeline Supply-Chain Security); Packaging & GitOps |
| 6. Back toward owning | Hybrid & On-Prem Cloud; Repatriation; Open Source & the Clouds; Testing, Policy, Secrets & IaC Platforms; the Homelab part (The Homelab through From Homelab to Colocation); GPU & AI Clouds; Where AI Runs: Home, Colo, Cloud or Frontier |
| All eras | Observability Platforms; Continuous Delivery Platforms; Multi-Tenancy, Policy & Security |

The Homelab part runs the whole path at the scale of one operator: hardware at home, storage, hypervisors, networks and routing, self-hosted apps, exposing services, models on home GPUs, and the move from a residence to colocation, then to cloud and hybrid.

## My Default

The eras don't replace each other; they stack, and a provider today sells all of them. My defaults for someone building on them now, from the costs each era revealed:

- **Rent the building, own the decision.** Colocation until utilization is high and steady enough to justify owning, which most never reach.
- **KVM for virtual machines,** with a microVM (Firecracker or Kata) or a user-space kernel (gVisor) wherever strangers' code shares a host.
- **Containers as the unit of deployment,** with OCI images built in CI and pulled from a registry you control, and a scheduler only when there are enough services to need one.
- **Declare infrastructure, bake images, and keep convergence for what's left,** with a license you can live with if its owner changes (Provisioning: Terraform, OpenTofu & the Alternatives).
- **Functions for spiky, short, stateless work,** priced against a container that runs all month.
- **A written exit,** for each rented layer, with the cost model that says when to take it (Repatriation).

What would change these: a workload that only runs on one provider's managed service, a residency requirement the clouds can't meet, or scale large enough that the provider's margin pays for a hardware team.

## How to Build It

The timeline adds no tables. It explains why [the core data model](/books/hosting-and-cloud/hosting-and-cloud-business#the-core-data-model) has one `resources` table with many kinds: each era added kinds without retiring the old ones, and a provider that sells hosting, VMs, clusters and functions must bill, suspend and attribute all of them the same way.

| Era | Kinds it added to `resources` | Meters it added |
| --- | --- | --- |
| 1 | `server`, `hosting_account`, `site`, `mailbox`, `domain`, `dns_zone` | Monthly plans, bandwidth |
| 2 | `virtual_machine`, `ip_address` | Monthly VPS plans |
| 3 | `volume`, `snapshot`, `image`, `bucket`, `network`, `subnet`, `load_balancer`, `database` | Instance-hours, then seconds; gigabyte-months; requests; egress |
| 4 | `container_service`, `cluster`, `node_pool`, `registry` | Cluster-hours, image storage and pulls |
| 5 | `function`, `edge_store`, `queue`, `topic`, `ci_pipeline` | Invocations, CPU-milliseconds, rows, messages, build minutes |
| 6 | `interconnect`, `placement_group`, regions whose `underlay` is a customer site | Per-core subscriptions, committed capacity |

## What This Means for the System You Build

- **Expect every layer to persist:** model old and new kinds in one resource table, billed and suspended the same way.
- **Date the decisions:** price models and isolation choices are products of their era, and the next era will change them.
- **Treat isolation as cost:** each stronger wall (VM, microVM, user-space kernel) trades density for safety, and the meter should reflect it.
- **Plan for tool ownership to change:** licenses and owners of hypervisors and IaC tools changed in this timeline, and will again.
- **Keep an exit** for every rented layer, priced.

## References

**Papers and standards**

- [RFC 959: File Transfer Protocol](https://www.rfc-editor.org/rfc/rfc959), Postel and Reynolds, October 1985
- [Tridgell and Mackerras: The rsync algorithm](https://openresearch-repository.anu.edu.au/handle/1885/40765), ANU technical report TR-CS-96-05, 1996
- [Kamp and Watson: Jails: Confining the omnipotent root](https://papers.freebsd.org/2000/phk-jails/), FreeBSD jails, 2000
- [Waldspurger: Memory Resource Management in VMware ESX Server](https://www.usenix.org/conference/osdi-02/memory-resource-management-vmware-esx-server), OSDI, December 2002
- [Barham et al.: Xen and the Art of Virtualization](https://www.cl.cam.ac.uk/research/srg/netos/papers/2003-xensosp.pdf), SOSP, October 2003, the 100-VM design target and overhead
- [Price and Tucker: Solaris Zones](https://www.usenix.org/legacy/publications/library/proceedings/lisa04/tech/price.html), LISA 2004
- [Verma et al.: Large-scale cluster management at Google with Borg](https://research.google/pubs/large-scale-cluster-management-at-google-with-borg/), EuroSys 2015
- [Agache et al.: Firecracker: Lightweight Virtualization for Serverless Applications](https://www.usenix.org/conference/nsdi20/presentation/agache), NSDI, February 2020
- [Uptime Institute: Tier classification](https://uptimeinstitute.com/tiers), Tier I to IV and concurrent maintainability

**Filings**

- [Equinix: Form 10-K for 2016, organization note](https://www.sec.gov/Archives/edgar/data/1101239/000162828017008031/R8.htm), incorporation on June 22, 1998
- [Equinix: Form 10-K for 2025](https://www.sec.gov/Archives/edgar/data/1101239/000110123926000032/eqix-20251231.htm), data centers and markets
- [Rackspace: Form 10-K for 2008](https://www.sec.gov/Archives/edgar/data/0001107694/000119312509041402/d10k.htm), operations beginning in 1998 and the August 8, 2008 listing
- [VMware: Form 10-K for 2007](https://www.sec.gov/Archives/edgar/data/1124610/000119312508043667/d10k.htm), incorporation in 1998 and first product in 1999
- [Dropbox: Form S-1 (February 2018)](https://www.sec.gov/Archives/edgar/data/0001467623/000119312518055809/d451946ds1.htm), infrastructure cost decreases from the Infrastructure Optimization
- [Broadcom: Form 8-K (November 2023)](https://www.sec.gov/Archives/edgar/data/1730168/000114036123054354/ef20015100_form8k.htm), completion of the VMware acquisition on November 22, 2023

**Announcements and release notes**

- [Intel: Intel Delivers New Era For Virtualization](https://www.intel.com/pressroom/archive/releases/2005/20051114comp.htm), hardware virtualization in the Pentium 4 662 and 672, November 14, 2005
- [OpenVZ: History](https://wiki.openvz.org/History), Virtuozzo's January 2002 release and OpenVZ in 2005
- [Kernel Newbies: Linux 2.6.20](https://kernelnewbies.org/Linux_2_6_20), KVM, released February 5, 2007
- [Kernel Newbies: Linux 2.6.24](https://kernelnewbies.org/Linux_2_6_24), control groups and PID and network namespaces, released January 24, 2008
- [FreeBSD: chroot(2)](https://man.freebsd.org/cgi/man.cgi?query=chroot&sektion=2), chroot's appearance in Version 7 AT&T UNIX
- [FreeBSD 4.0 release notes](https://www.freebsd.org/releases/4.0R/notes/), the jail system call
- [GNU: CFEngine](https://www.gnu.org/software/cfengine/cfdetails.html), begun in 1993 by Mark Burgess
- [The Architecture of Open Source Applications: Puppet](https://aosabook.org/en/v2/puppet.html), the 2004 prototype and February 2005 start
- [Ruby on Rails blog: SwitchTower as an automated deployment archetype](https://rubyonrails.org/2005/11/29/switchtower-as-an-automated-deployment-archetype), November 29, 2005
- [AWS: Announcing Amazon S3](https://aws.amazon.com/about-aws/whats-new/2006/03/13/announcing-amazon-s3---simple-storage-service/), March 13, 2006
- [AWS News Blog: Amazon EC2 Beta](https://aws.amazon.com/blogs/aws/amazon_ec2_beta/), August 25, 2006, the first instance and its price
- [Google App Engine blog: Introducing Google App Engine](http://googleappengine.blogspot.com/2008/04/introducing-google-app-engine-our-new.html), April 7, 2008, and the preview limits
- [Microsoft: Commercial availability of Windows Azure platform](https://learn.microsoft.com/en-us/archive/blogs/usisvde/commercial-availability-of-windows-azure-platform), paid service from February 1, 2010
- [Chef: Happy birthday, Chef](https://www.chef.io/blog/happy-birthday-chef), the first public release on January 16, 2009
- [AWS: Introducing AWS CloudFormation](https://aws.amazon.com/about-aws/whats-new/2011/02/25/introducing-aws-cloudformation/), February 25, 2011
- [GitHub: saltstack/salt](https://github.com/saltstack/salt), the initial commit on February 20, 2011
- [GitHub: ansible/ansible](https://github.com/ansible/ansible), the first commit on February 23, 2012
- [Heroku: The New Heroku (Part 1 of 4): The Process Model & Procfile](https://www.heroku.com/blog/the_new_heroku_1_process_model_procfile/), June 20, 2011
- [The Twelve-Factor App](https://12factor.net/), Adam Wiggins
- [GitHub: moby/moby tags](https://github.com/moby/moby/tags), Docker v0.1.0 (March 26, 2013) and v1.0.0 (June 9, 2014)
- [Mitchell Hashimoto: Packer](https://mitchellh.com/writing/packer), June 28, 2013
- [Google Open Source blog: An update on container support on Google Cloud Platform](https://opensource.googleblog.com/2014/06/an-update-on-container-support-on.html), Kubernetes and 2 billion containers a week, June 2014
- [HashiCorp: Terraform announcement](https://www.hashicorp.com/blog/terraform-announcement), July 28, 2014
- [AWS News Blog: EC2 Container Service](https://aws.amazon.com/blogs/aws/cloud-container-management/), preview on November 13, 2014
- [AWS News Blog: AWS Lambda](https://aws.amazon.com/blogs/aws/run-code-cloud/), preview on November 13, 2014, 100 ms billing units and the 60-second timeout
- [Open Container Initiative: About](https://opencontainers.org/about/overview/), launched June 22, 2015
- [Google Cloud Platform blog: Kubernetes V1 released](https://cloudplatform.googleblog.com/2015/07/Kubernetes-V1-Released.html), July 21, 2015
- [HashiCorp: Nomad announcement](https://www.hashicorp.com/blog/nomad-announcement), September 28, 2015
- [Netlify: Introducing Deploy Previews](https://www.netlify.com/blog/2016/07/20/introducing-deploy-previews-in-netlify/), July 20, 2016
- [Cloudflare: Introducing Cloudflare Workers](https://blog.cloudflare.com/introducing-cloudflare-workers/), September 29, 2017
- [Google Cloud: Open-sourcing gVisor](https://cloud.google.com/blog/products/identity-security/open-sourcing-gvisor-a-sandboxed-container-runtime), May 2, 2018
- [AWS News Blog: Firecracker](https://aws.amazon.com/blogs/aws/firecracker-lightweight-virtualization-for-serverless-computing/), November 26, 2018, launch time and memory per microVM
- [Mozilla Hacks: Standardizing WASI](https://hacks.mozilla.org/2019/03/standardizing-wasi-a-webassembly-system-interface/), March 27, 2019
- [Google Cloud: Next '19 day 1 recap](https://cloud.google.com/blog/topics/inside-google-cloud/next19-recap-day1), Anthos, April 9, 2019
- [GitHub: GitHub Actions now supports CI/CD](https://github.blog/2019-08-08-github-actions-now-supports-ci-cd/), August 8, 2019
- [Microsoft Azure: Announcing Azure Arc](https://azure.microsoft.com/en-us/blog/azure-services-now-run-anywhere-with-new-hybrid-capabilities-announcing-azure-arc/), November 4, 2019
- [AWS: General availability of AWS Outposts](https://aws.amazon.com/about-aws/whats-new/2019/12/announcing-general-availability-of-aws-outposts/), December 3, 2019
- [Microsoft Learn: Azure Stack HCI is now part of Azure Local](https://learn.microsoft.com/en-us/azure/azure-local/rename-to-azure-local), the rename
- [Vercel: ZEIT is now Vercel](https://vercel.com/blog/zeit-is-now-vercel), April 21, 2020
- [CNCF: Argo has graduated](https://www.cncf.io/announcements/2022/12/06/the-cloud-native-computing-foundation-announces-argo-has-graduated/), December 6, 2022
- [Heroku: Heroku's next chapter](https://www.heroku.com/blog/next-chapter/), free plans ending November 28, 2022
- [HashiCorp: HashiCorp adopts the Business Source License](https://www.hashicorp.com/blog/hashicorp-adopts-business-source-license), August 10, 2023
- [Oxide: The cloud computer](https://oxide.computer/blog/the-cloud-computer), general availability on October 26, 2023
- [OpenTofu: OpenTofu is going GA](https://opentofu.org/blog/opentofu-is-going-ga/), 1.6.0 on January 10, 2024
- [Heroku: An update on Heroku](https://www.heroku.com/blog/an-update-on-heroku/), the sustaining engineering model, February 6, 2026

**In practice**

- [37signals: Why we're leaving the cloud](https://world.hey.com/dhh/why-we-re-leaving-the-cloud-654b47e0), October 19, 2022
- [37signals: We stand to save $7m over five years from our cloud exit](https://world.hey.com/dhh/we-stand-to-save-7m-over-five-years-from-our-cloud-exit-53996caa), February 21, 2023, the 2022 bill and projected savings
- [37signals: Our cloud-exit savings will now top ten million over five years](https://world.hey.com/dhh/our-cloud-exit-savings-will-now-top-ten-million-over-five-years-c7d9b5bd), October 17, 2024, the bill after the exit
