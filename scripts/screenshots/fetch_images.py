import urllib.request
import os

asins = {
    'B0H4S6JNHF': 'public/images/books/auditors-risk-compass.jpg',
    'B0GX33CDRF': 'public/images/books/blueprint-of-operations.jpg',
    'B0G51LS6D6': 'public/images/books/power-professional.jpg'
}

req_headers = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'}

for asin, path in asins.items():
    url = f"https://images-na.ssl-images-amazon.com/images/P/{asin}.01.LZZZZZZZ.jpg"
    try:
        req = urllib.request.Request(url, headers=req_headers)
        with urllib.request.urlopen(req) as response:
            data = response.read()
            # if amazon returns a 1x1 gif it's 43 bytes
            if len(data) > 100:
                with open(path, 'wb') as f:
                    f.write(data)
                print(f"Success for {asin}, size: {len(data)}")
            else:
                print(f"Skipped {asin}, returned 1x1 GIF")
    except Exception as e:
        print(f"Error for {asin}: {e}")
