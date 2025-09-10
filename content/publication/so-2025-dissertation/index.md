---
title: "Protecting the Integrity of Modern Web Resources by Leveraging Patterns of Change"
date: 2025-05-22
publishDate: 2025-05-21
authors: ["admin"]
publication_types: ["7"]
abstract: "
The modern web is a collection of remote resources that are identified by their location.
These location-based addresses allow for mutations of the underlying content and provide powerful features that are invaluable to modern infrastructure and software deployment models.
However, these address-based identifiers do not provide security-related guarantees, such as verifying the identity of the address owner or the integrity of the provided content. As the web has grown in size and complexity, so too has this problem.
In this dissertation, we methodically demonstrate how the fundamental nature of location-based addresses in the modern web presents challenges to verifying the integrity of resources in different contexts.
We leverage these findings to introduce a novel, application-agnostic defense mechanism.

First, we perform an experiment that investigates how expired domains pose a threat to clients who have no standardized method to distinguish that the domains they rely upon have expired, and possibly been re-registered.
To this end, we simulate the behavior of an opportunistic, target-agnostic attack aimed at abusing residual trust in expired domains.
We find that it is possible for low-budget, malicious actors to attract requests from millions of IP addresses by re-registering expired domains.
Moreover, we detail how owners can profile the residual trust traffic to identify the services that were previously offered on their domains, serving as empirical evidence that this attack vector can be abused.

Second, we characterize modern JavaScript from a security-conscious perspective, focusing on the feasibility of defending against supply chain attacks.
We implement a robust and efficient crawling infrastructure to amass scripts from tens of thousands of domains, and present our findings on a representative sample comprising millions of scripts.
In contrast to past work that reported that scripts are mostly static, we find that scripts that frequently change should be considered first-class citizens in the modern web ecosystem, and that the ways in which scripts change remain constant over time.
Furthermore, we show that the use of strict integrity alone cannot provide satisfactory security guarantees.
We do this by analyzing the use of strict integrity verification at the granularity of the script providers themselves, offering a more complete perspective as compared to prior work.

Third, we conduct the first large-scale analysis of mobile app dependencies through a dual perspective accounting for time and version updates, with a focus on expirations and stability.
Given the lack of existing, high-quality datasets, we detail an approach to build a representative corpus of Android applications, and extract their dependencies by utilizing a dynamic, UI-guided test input generator.
Using the extracted traffic, combined with a methodology that deduces potential periods of vulnerability for individual APKs, we characterize how apps may have been affected by expired domains throughout time.
Our findings indicate that the threat of expired domains in app dependencies is nontrivial at scale, affecting hundreds of apps and thousands of APKs, and uncover immediately-registrable domains that could have been abused.
Furthermore, we report empirical evidence showing that even the most security-conscious users cannot protect themselves against the risk of their using an app that has an expired dependency, even if they can update their apps instantaneously.

Finally, we propose a defense mechanism that can bootstrap integrity guarantees for web resources in a generalizable, cross-platform manner. 
By leveraging existing support for service workers to enforce integrity policies that declare the (un)expected properties of resources in a flexible manner, the policy verification and enforcement components ensure integrity guarantees for users with minimal overhead.
We discuss how basic integrity policies can serve as building blocks for a comprehensive set of integrity policies, while providing guarantees that would be sufficient to defend against recent supply chain attacks detailed by security industry reports.
Additionally, we evaluate our open-sourced prototype by simulating deployments on 200 high-, mid-, and low-ranking websites.
We find that our proposal offers the ability to bootstrap marked security improvements with an overall overhead of hundreds of milliseconds on initial page loads, and negligible overhead on reloads, regardless of network speeds.
Furthermore, from examining archived data for the sample sites, we find that several of the proposed policy building blocks suit their dependency usage patterns, and would incur minimal administrative overhead.
"
featured: true
# publication: "In *Proceedings of the 34th USENIX Security Symposium, 2025 (to appear)*"
# url_pdf: "so-2025-dissertation.pdf"
links:
# - name: Artifacts
#   url: https://doi.org/10.5281/zenodo.14737144
# - name: Talk
#   url: 
---
