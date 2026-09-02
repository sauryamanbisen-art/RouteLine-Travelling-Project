import urllib.request
import os

urls = {
    'udaipur': 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1d/Taj_Lake_Palace%2C_Udaipur.jpg/800px-Taj_Lake_Palace%2C_Udaipur.jpg',
    'mumbai': 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/cd/Gateway_of_India.png/800px-Gateway_of_India.png'
}

for name, url in urls.items():
    urllib.request.urlretrieve(url, f'src/assets/{name}.png')

print("Downloaded.")
