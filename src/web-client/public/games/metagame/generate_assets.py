from PIL import Image, ImageDraw
import os

def create_cat_sprite(name, color=(255, 200, 150)):
    # Create a 256x256 image with 4 frames
    img = Image.new('RGBA', (1024, 256), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)
    
    for i in range(4):
        # Draw cat body
        x = i * 256
        draw.ellipse([x + 80, 100, x + 176, 196], fill=color)
        # Draw ears
        draw.polygon([x + 100, 100, x + 80, 60, x + 120, 80], fill=color)
        draw.polygon([x + 156, 100, x + 176, 60, x + 136, 80], fill=color)
        # Draw eyes
        eye_y = 140 if i % 2 == 0 else 145
        draw.ellipse([x + 110, eye_y, x + 130, eye_y + 20], fill='black')
        draw.ellipse([x + 126, eye_y, x + 146, eye_y + 20], fill='black')
        # Draw nose
        draw.polygon([x + 118, 160, x + 138, 160, x + 128, 170], fill='pink')
        # Draw mouth
        if name == 'eating':
            draw.arc([x + 110, 170, x + 146, 190], 0, 180, fill='black', width=2)
        elif name == 'coughing':
            draw.arc([x + 110, 170, x + 146, 190], 180, 360, fill='black', width=2)
        else:
            draw.line([x + 110, 180, x + 146, 180], fill='black', width=2)
    
    img.save(f'assets/cat-{name}.png')

def create_hat(name, color):
    img = Image.new('RGBA', (128, 128), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)
    
    if name == 'crown':
        # Draw crown
        points = [(20, 80), (40, 40), (60, 60), (80, 30), (100, 50), (108, 80)]
        draw.polygon(points, fill=color)
        # Draw jewels
        for x in [40, 60, 80, 100]:
            draw.ellipse([x-5, 45, x+5, 55], fill='red')
    elif name == 'wizard':
        # Draw wizard hat
        draw.polygon([(30, 80), (64, 30), (98, 80)], fill=color)
        draw.rectangle([(40, 80), (88, 100)], fill=color)
    elif name == 'cowboy':
        # Draw cowboy hat
        draw.ellipse([(20, 60), (108, 100)], fill=color)
        draw.rectangle([(30, 40), (98, 60)], fill=color)
    elif name == 'beanie':
        # Draw beanie
        draw.ellipse([(30, 60), (98, 100)], fill=color)
        draw.rectangle([(40, 40), (88, 60)], fill=color)
    elif name == 'party':
        # Draw party hat
        draw.polygon([(30, 80), (64, 30), (98, 80)], fill=color)
    elif name == 'santa':
        # Draw santa hat
        draw.polygon([(30, 80), (64, 30), (98, 80)], fill='red')
        draw.rectangle([(40, 80), (88, 100)], fill='white')
    elif name == 'pirate':
        # Draw pirate hat
        draw.ellipse([(20, 60), (108, 100)], fill=color)
        draw.rectangle([(30, 40), (98, 60)], fill=color)
        # Draw skull
        draw.ellipse([(50, 50), (78, 78)], fill='white')
        draw.ellipse([(58, 60), (70, 72)], fill='black')
    elif name == 'crown_golden':
        # Draw golden crown
        points = [(20, 80), (40, 40), (60, 60), (80, 30), (100, 50), (108, 80)]
        draw.polygon(points, fill='gold')
        # Draw jewels
        for x in [40, 60, 80, 100]:
            draw.ellipse([x-5, 45, x+5, 55], fill='red')
    
    img.save(f'assets/hats/{name}.png')

def create_icons():
    # Create fish treat icon
    img = Image.new('RGBA', (64, 64), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)
    draw.ellipse([10, 20, 54, 44], fill='orange')
    draw.polygon([54, 32, 64, 20, 64, 44], fill='orange')
    img.save('assets/fish-treat.png')
    
    # Create hat icon
    img = Image.new('RGBA', (64, 64), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)
    draw.polygon([(20, 40), (32, 20), (44, 40)], fill='blue')
    draw.rectangle([(24, 40), (40, 48)], fill='blue')
    img.save('assets/hat-icon.png')

def main():
    # Create cat sprites
    create_cat_sprite('idle')
    create_cat_sprite('eating', (255, 180, 130))
    create_cat_sprite('coughing', (255, 160, 110))
    
    # Create hats
    create_hat('crown', 'gold')
    create_hat('wizard', 'blue')
    create_hat('cowboy', 'brown')
    create_hat('beanie', 'red')
    create_hat('party', 'yellow')
    create_hat('santa', 'red')
    create_hat('pirate', 'black')
    create_hat('crown_golden', 'gold')
    
    # Create icons
    create_icons()
    
    # Create empty sound files
    for sound in ['eating', 'coughing', 'reveal_common', 'reveal_rare', 'reveal_ultraRare']:
        open(f'assets/sounds/{sound}.mp3', 'w').close()

if __name__ == '__main__':
    main() 