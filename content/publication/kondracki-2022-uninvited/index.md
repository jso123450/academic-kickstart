---
title: "Uninvited Guests: Analyzing the Identity and Behavior of Certificate Transparency Bots"
date: 2022-08-10
publishDate: 2022-08-10
authors: ["Brian Kondracki", "admin", "Nick Nikiforakis"]
publication_types: ["1"]
abstract: "Since its creation, Certificate Transparency (CT) has served
as a vital component of the secure web. However, with the
increase in TLS adoption, CT has essentially become a defacto
log for all newly-created websites, announcing to the public
the existence of web endpoints, including those that could
have otherwise remained hidden. As a result, web bots can use
CT to probe websites in real time, as they are created. Little is
known about these bots, their behaviors, and their intentions.
\n\n
In this paper we present CTPOT, a distributed honeypot
system which creates new TLS certificates for the purpose
of advertising previously non-existent domains, and records
the activity generated towards them from a number of network
vantage points. Using CTPOT, we create 4,657 TLS certificates
over a period of ten weeks, attracting 1.5 million web requests
from 31,898 unique IP addresses. We find that CT bots occupy a
distinct subset of the overall web bot population, with less than
2% overlap between IP addresses of CT bots and traditional
host-scanning web bots. By creating certificates with varying
content types, we are able to further sub-divide the CT bot
population into subsets of varying intentions, revealing a stark
contrast in malicious behavior among these groups. Finally, we
correlate observed bot IP addresses into campaigns using the
file paths requested by each bot, and find 105 malicious campaigns 
targeting the domains we advertise. Our findings shed
light onto the CT bot ecosystem, revealing that it is not only
distinct to that of traditional IP-based bots, but is composed of
numerous entities with varying targets and behaviors.

Awards:
- [NSA 11th Annual Best Scientific Cybersecurity Paper](https://www.nsa.gov/Press-Room/News-Highlights/Article/Article/3676583/nsa-awards-authors-of-study-of-automated-attacks-on-new-webservers/)
"
featured: true
publication: "In *Proceedings of the USENIX Security Symposium (USENIX Security), 2022*"
url_pdf: "kondracki-2022-uninvited.pdf"
links:
- name: Talk
  url: https://www.youtube.com/watch?v=WqQsTEQa6fM&t=541s
- name: NSA 11th Annual Best Scientific Cybersecurity Paper
  url: https://www.nsa.gov/Press-Room/News-Highlights/Article/Article/3676583/nsa-awards-authors-of-study-of-automated-attacks-on-new-webservers/
---
