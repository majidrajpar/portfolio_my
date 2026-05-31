import urllib.request
import urllib.error

links = [
    'https://www.amazon.com/dp/B0GDTBRZPM',
    'https://www.amazon.com/dp/B0GDMW53GG',
    'https://www.amazon.com/dp/B0G7T4X3RT',
    'https://www.amazon.com/dp/B0FCG96QS8',
    'https://www.amazon.com/dp/B0DY2NRPQ9',
    'https://www.corporatecomplianceinsights.com/',
    'https://www.consultancy-me.com/',
    'https://internalauditor.theiia.org/en/voices/2026/february/teaching-an-algorithm-to-filter-false-flags/',
    'https://www.grcreport.com/post/the-cfo-is-the-audit-independence-risk-youre-not-managing',
    'https://www.grcreport.com/post/ai-authorization-is-not-ai-accountability',
    'https://www.accaglobal.com/gb/en/member/member/accounting-business.html'
]

headers = {'User-Agent': 'Mozilla/5.0'}

for url in links:
    try:
        req = urllib.request.Request(url, headers=headers)
        response = urllib.request.urlopen(req, timeout=10)
        print(f'OK: {url}')
    except urllib.error.HTTPError as e:
        print(f'ERROR {e.code}: {url}')
    except Exception as e:
        print(f'FAILED {e}: {url}')
