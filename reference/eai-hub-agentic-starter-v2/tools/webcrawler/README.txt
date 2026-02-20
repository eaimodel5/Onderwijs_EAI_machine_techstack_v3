
WebCrawlerPredpia – EAI Pre-DPIA Crawler Tool

Inhoud:
- webcrawler_predpia.py: Python-klasse met robuuste crawler
- README.txt: deze uitleg

Functionaliteit:
- Scant een website op basis van een vooraf gedefinieerde rubric
- Berekent density-score en bewijsniveau per match
- Logt HTML-context en gevonden locatie
- Alleen actief na expliciete toestemming (confirm=True)

Gebruik:
from webcrawler_predpia import WebCrawlerPredpia
crawler = WebCrawlerPredpia()
result = crawler.crawl("https://voorbeeld.ai", confirm=True)

Let op:
- Deze crawler bevat een voorbeeldrubric. Voor productie: rubric uitbreiden.
- Externe dependencies: beautifulsoup4, requests
