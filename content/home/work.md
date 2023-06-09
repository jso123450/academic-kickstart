+++
# Experience widget.
widget = "experience"  # See https://sourcethemes.com/academic/docs/page-builder/
headless = true  # This file represents a page section.
active = true  # Activate this widget? true/false
weight = 20  # Order that this section will appear.

title = "Work"
subtitle = ""

# Date format for experience
#   Refer to https://sourcethemes.com/academic/docs/customization/#date-format
date_format = "Jan 2006"

# Experiences.
#   Add/remove as many `[[experience]]` blocks below as you like.
#   Required fields are `title`, `company`, and `date_start`.
#   Leave `date_end` empty if it's your current employer.

[[experience]]
  title = "Research Assistant"
  company = "PragSec Lab @ Stony Brook University"
  company_url = "https://securitee.org"
  location = "Stony Brook, New York"
  date_start = "2020-08-01"
  date_end = ""
  description = """
  Projects:
  * Designing an application-agnostic link management system that prevents access to external dependencies of websites if such links violate customizable integrity policies
  * Demonstrated that strict integrity verification of scripts cannot protect the web and provided insight for future methods through a large-scale, data-driven analysis [(Things Change)](publication/so-2023-more/)
  * Profiled the behavior of bots that monitor Certificate Transparency logs, analyzing how bots of various intentions and origins react to new certificates within seconds [(Uninvited Guests)](publication/kondracki-2022-uninvited)
  * Illustrated the capability of adversaries to potentially affect millions of IP addresses in tens of thousands of autonomous systems by re-registering a few hundred domains [(Domains Change)](/publication/so-2022-domains/)
  * Proposed and evaluated deceptive web authentication mechanisms that remove the integrity of a web application from the attacker's arsenal, and instead place the lack of it in the defender's arsenal [(Click This, Not That)](/publication/barron-2021-click/)
  """

[[experience]]
  title = "Software Engineering Intern"
  company = "Bot Management / API Shield @ Cloudflare"
  company_url = "https://www.cloudflare.com/products/bot-management/"
  location = "Remote"
  date_start = "2023-06-05"
  date_end = "2023-08-25"
  description = "Analyzing API traffic to reduce attack surface, detect malicious bot activity, and identify anomalous server-side behavior"

[[experience]]
  title = "PhD Research Intern"
  company = "Research @ NortonLifeLock"
  company_url = "https://www.nortonlifelock.com/us/en/research-labs/"
  location = "Remote"
  date_start = "2022-05-31"
  date_end = "2022-08-19"
  description = "Analyzing the integrity of Android applications through dynamic analysis (ongoing)"

[[experience]]
  title = "Software Development Engineer Intern"
  company = "Alexa @ Amazon"
  company_url = "https://alexa.amazon.com/"
  location = "Seattle, Washington"
  date_start = "2019-06-01"
  date_end = "2019-08-01"
  description = "Created an intent recommendation service for third-party Alexa skills using short utterance text data"

[[experience]]
  title = "Software Engineer Intern"
  company = "Softheon"
  company_url = "https://www.softheon.com/"
  location = "Stony Brook, New York"
  date_start = "2018-06-01"
  date_end = "2018-12-01"
  description = """
  Built the prototype of a new state health exchange platform and established a preprocessing library used to build machine learning models
  """

+++
