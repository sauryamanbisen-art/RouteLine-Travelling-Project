from PIL import Image

def crop_images():
    # Open the user's mockup image
    img_path = '/Users/sauryamanbisen/.gemini/antigravity-ide/brain/6e39f90a-c2ab-4554-bc1b-cd61649fe884/.user_uploaded/media_1788290234073.png'
    img = Image.open(img_path).convert('RGB')

    # The image is 520x240 and contains two cards on a blue background.
    # We want ONLY the building from the first card (Udaipur)
    # Estimated building bounds for left card: x: 30 to 230, y: 110 to 220
    udaipur = img.crop((40, 110, 220, 210))
    udaipur.save('udaipur.jpg', quality=95)

    # Estimated building bounds for right card (Mumbai): x: 290 to 490, y: 110 to 220
    mumbai = img.crop((300, 110, 480, 210))
    mumbai.save('mumbai.jpg', quality=95)

    print("Cropped successfully!")

if __name__ == '__main__':
    crop_images()
