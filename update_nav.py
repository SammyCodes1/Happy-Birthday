import os

files = ['index.html', 'story.html', 'gallery.html', 'wishes.html', 'memories.html']
for f in files:
    if not os.path.exists(f): continue
    with open(f, 'r', encoding='utf-8') as file:
        content = file.read()
    
    # 1. Update Desktop Nav
    content = content.replace(
        '<a class="nav__link" href="wishes.html">Wishes</a></div>',
        '<a class="nav__link" href="wishes.html">Wishes</a><a class="nav__link" href="birthday.html">Birthday</a></div>'
    )
    content = content.replace(
        '<a class="nav__link active" href="wishes.html">Wishes</a></div>',
        '<a class="nav__link active" href="wishes.html">Wishes</a><a class="nav__link" href="birthday.html">Birthday</a></div>'
    )
    
    # 2. Update Mobile Nav
    content = content.replace(
        '<a class="mobile-menu__link" style="--i:4" href="wishes.html">Wishes</a></div></aside>',
        '<a class="mobile-menu__link" style="--i:4" href="wishes.html">Wishes</a><a class="mobile-menu__link" style="--i:5" href="birthday.html">Birthday</a></div></aside>'
    )
    
    # 3. Update Footer
    content = content.replace(
        '<a href="wishes.html">Wishes</a></div><hr class="footer__rule">',
        '<a href="wishes.html">Wishes</a><a href="birthday.html">Birthday</a></div><hr class="footer__rule">'
    )
    
    with open(f, 'w', encoding='utf-8') as file:
        file.write(content)
