---
title: "The More Things Change, the More They Stay the Same: Integrity of Modern JavaScript"
date: 2023-01-25
publishDate: 2023-05-01
authors: ["admin", "Michael Ferdman", "Nick Nikiforakis"]
publication_types: ["1"]
abstract: "The modern web is a collection of remote resources that are identified by their location and composed of interleaving networks of trust. Supply chain attacks compromise the users of a target domain by leveraging its often large set of trusted third parties who provide resources such as JavaScript. The ubiquity of JavaScript, paired with its ability to execute arbitrary code on client machines, makes this particular web resource an ideal vector for supply chain attacks. Currently, there exists no robust method for users browsing the web to verify that the script content they receive from a third party is the expected content. 

In this paper, we present key insights to inform the design of robust integrity mechanisms, derived from our large-scale analyses of the 6M scripts we collected while crawling 44K domains every day for 77 days. We find that scripts that frequently change should be considered first-class citizens in the modern web ecosystem, and that the ways in which scripts change remain constant over time. Furthermore, we present analyses on the use of strict integrity verification (e.g., Subresource Integrity) at the granularity of the script providers themselves, offering a more complete perspective and demonstrating that the use of strict integrity alone cannot provide satisfactory security guarantees. We conclude that it is infeasible for a client to distinguish benign changes from malicious ones without additional, external knowledge, motivating the need for a new protocol to provide clients the necessary context to assess the potential ramifications of script changes."
featured: true
publication: "In *Proceedings of the ACM Web Conference (WWW), 2023*"
url_pdf: "so-2023-more.pdf"
# links:
# - name: Teaser
#   url: https://www.youtube.com/watch?v=5NwnnfEbxlE
# - name: Talk
#   url: https://www.youtube.com/watch?v=8mgHW3CGsm8
---
