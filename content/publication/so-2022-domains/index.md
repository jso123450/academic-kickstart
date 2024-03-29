---
title: "Domains Do Change Their Spots: Quantifying Potential Abuse of Residual Trust"
date: 2021-09-04
publishDate: 2022-05-23
authors: ["admin", "Najmeh Miramirkhani", "Michael Ferdman", "Nick Nikiforakis"]
publication_types: ["1"]
abstract: "When domains expire and are released to the public, adversaries can re-register them with the hope of exploiting residual trust from clients that are unaware of the change in ownership. Because domain name resolution is integral to the web, possible clients run the gamut from humans browsing the web to automated and periodic processes such as system updates. For an adversary, this trivially yields access to an attack vector that can affect a multitude of diverse systems and devices. We reason that some domains which experience residual trust and are valuable from a security perspective are not valuable from a dropcatching perspective and, as such, can be re-registered by an adversary without participating in fiercely competitive auctions for expired domains. 
\n\n
In this paper, we present an investigation into this attack vector using a top-down, opportunistic approach, as opposed to bottom-up approaches used by prior work that target specific systems and infrastructure. Throughout a one-month re-registration period, we identify potentially valuable dropped domains using a threshold of passive DNS resolutions, re-register, and deploy them with basic honeypot services. We then analyze the traffic to these domains to find instances of residual trust that can be exploited. Our honeypot services recorded, over a four-month period, 650,737,621 requests from 5,540,379 unique IP addresses situated in 22,744 different autonomous systems to the 201 re-registered domains. Although a majority of these domains may not pose significant security risks, we are most concerned with and thus focus our discussion on unusual domains which receive orders of magnitude more traffic and types of traffic that are significantly different from the other domains. These include domains which previously functioned as a torrent tracker, an API for a computer lab usage statistics service used by many universities, an API that was a point of contact for a common Android haptics library, security company DNS sinkhole servers, an Internet radio and music station, command-and-control servers for malware and potentially unwanted programs, and an email tracker. Our findings demonstrate that expired domains pose a real threat to the security of the Internet ecosystem and that adversaries with modest budgets can compromise a wide range of systems and services by merely registering previously-popular domains that were left to expire."
featured: true
publication: "In *Proceedings of the IEEE Symposium on Security and Privacy (IEEE S&P), 2022*"
url_pdf: "so-2022-domains.pdf"
links:
- name: Teaser
  url: https://www.youtube.com/watch?v=5NwnnfEbxlE&list=PLSXA1jR2OSPCQAdwDqummDi9dNxiHJWLx&index=1
- name: Talk
  url: https://www.youtube.com/watch?v=8mgHW3CGsm8
---
