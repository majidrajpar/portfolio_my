import urllib.request
urls = [
    "https://vertexaisearch.cloud.google.com/grounding-api-redirect/AUZIYQGDNJmFeiQ2Jns6fA7ymKorCqAYyk1kTLn5SA_baQvWEA2jsuGv-ielvuIFn35duurnRVFNY99g0uxKJdSXDGDqh70nDo86e80z8Q59WK4kGXQdr2MpyoLgLi46jbLDyYtDjjHButw3N7VNFtL5YQmL5WJme6yOg9O1Teot-oMc4Rxx0ypA2d07C7XfbYEc7UCu8eZ2Q3Fl83MFtHvKWEqN5vLD8dI=",
    "https://vertexaisearch.cloud.google.com/grounding-api-redirect/AUZIYQFAlbQxtLdd7lOGFaj1bGhT211ha_kFx52Z3c986lHNzr-Phw9EQV3czkp22DMeo9SNtXuwEFurKtMJY5O7Dw4xCcttHIquYJsF6-hwciDwJrJajWqDFAFFb3j0GlI3tLw8GE5s34Iz-Wrptb9bS7sCvAatiFLZSqingqM=",
    "https://vertexaisearch.cloud.google.com/grounding-api-redirect/AUZIYQGwKJp92V9PxJYvwtit9VtP_5sf3bZUK_Hay3298c-ZFEHZK3t-B-Qpxg_oP1jQWFQFDL9kC5QXZDZiRiwpZU_XLvW0oLOtDkzfG3j_oN25PcWOFl6do1j_Cyis5zh1WFQG3ZPb9HYXtBuYwO_CGK4VyP9S6X7wG4Shw0F4rEbYh-91ABNc5m4FQeIuKqWQG4tPEU5QUd7W61hdRySDRnqkMtdLjz68Np9qOn4Bq2OWvdqTfg4_pw=="
]
for url in urls:
    try:
        req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
        res = urllib.request.urlopen(req)
        print("Resolved:", res.url)
    except Exception as e:
        print("Error:", url, str(e))
