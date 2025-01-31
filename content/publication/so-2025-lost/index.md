---
title: "Lost in the Mists of Time: Expirations in DNS Footprints of Mobile Apps"
date: 2025-01-23
publishDate: 2025-08-13
authors: ["admin", "Iskander Sanchez-Rola", "Nick Nikiforakis"]
publication_types: ["1"]
abstract: "Compared to the traditional desktop setting where web applications (apps) are live by nature, mobile apps are similar to binary programs that are installed on devices, in that they remain static until they are updated. However, they can also contain live, dynamic components if they interface with the web. This may lead to a confusing scenario, in which a mobile app itself has not been updated, but changes in dynamic components have caused changes in the overall app behavior.
\n\n
In this work, we present the ﬁrst large-scale analysis of mobile app dependencies through a dual perspective accounting for time and version updates, with a focus on expired domains. First, we detail a methodology to build a representative corpus comprising 77,206 versions of 15,124 unique Android apps. Next, we extract the unique eTLD+1 domain dependencies — the “DNS footprint” — of each APK by monitoring the network trafﬁc produced with a dynamic, UI-guided test input generator and report on the footprint of a typical app. Using these footprints, combined with a methodology that deduces potential periods of vulnerability for individual APKs by leveraging passive DNS, we characterize how apps may have been affected by expired domains throughout time. Our ﬁndings indicate that the threat of expired domains in app dependencies is nontrivial at scale, affecting hundreds of apps and thousands of APKs, occasionally affecting apps that rank within the top ten of their categories, apps that have hundreds of millions of downloads, or apps that were the latest version. Furthermore, we uncovered 41 immediately registrable domains that were found in app footprints during our analyses, and provide evidence in the form of case studies as to their potential for abuse. We also ﬁnd that even the most security-conscious users cannot protect themselves against the risk of their using an app that has an expired dependency, even if they can update their apps instantaneously.
"
featured: true
publication: "In *Proceedings of the 34th USENIX Security Symposium, 2025 (to appear)*"
# url_pdf: ""
links:
- name: Artifacts
  url: https://doi.org/10.5281/zenodo.14737144
# - name: Talk
#   url: 
---
