import os

pages_flow = {
    'index.html': {'url': 'story.html', 'text': 'Read Her Story'},
    'story.html': {'url': 'gallery.html', 'text': 'View the Gallery'},
    'gallery.html': {'url': 'wishes.html', 'text': 'See the Wishes'},
    'wishes.html': {'url': 'birthday.html', 'text': 'Go to Birthday Page'},
    'birthday.html': {'url': 'index.html', 'text': 'Back to Home'}
}

template = """
<section class="section" style="padding-top: 0; padding-bottom: 4rem; text-align: center;">
  <div class="container">
    <a class="button" href="{url}" style="font-size: 1.2rem; padding: 1.2rem 2.5rem;">Next: {text} ➔</a>
  </div>
</section>
"""

for filename, data in pages_flow.items():
    if not os.path.exists(filename): continue
    
    with open(filename, 'r', encoding='utf-8') as f:
        content = f.read()
        
    # Check if we already added it to prevent duplicates
    if "Next:" in content and "➔" in content:
        continue
        
    replacement = template.format(url=data['url'], text=data['text']) + "</main>"
    content = content.replace("</main>", replacement)
    
    with open(filename, 'w', encoding='utf-8') as f:
        f.write(content)

print("Next buttons added successfully.")
