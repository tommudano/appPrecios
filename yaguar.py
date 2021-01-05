#!/usr/bin/env python
from flask import Flask, render_template;
import requests

app = Flask(__name__)

@app.route("/")
def home():
  return render_template('./index.html')
@app.route('/yaguar/<busqueda>', methods=['GET'])
def getYaguar(busqueda):
  session = requests.session()

  cookies = {
      '_ga': 'GA1.3.1407963336.1608827937',
      '__utmz': '35398499.1608914547.1.1.utmcsr=google|utmccn=(organic)|utmcmd=organic|utmctr=(not%20provided)',
      'Comisionista': 'False',
      'Recordame': '1',
      'ASPSESSIONIDSCTDSBQQ': 'MAFFGPJCOHECNMGBKIIOAIFB',
      '__utma': '35398499.1407963336.1608827937.1609288435.1609456154.4',
      '__utmc': '35398499',
      '__utmt': '1',
      '__utmb': '35398499.1.10.1609456154',
      '_gid': 'GA1.3.1114637443.1609456157',
      '_gat_gtag_UA_110860612_1': '1',
      '_gat_UA-110860612-1': '1',
  }

  headers = {
      'Connection': 'keep-alive',
      'Cache-Control': 'max-age=0',
      'sec-ch-ua': '"Google Chrome";v="87", " Not;A Brand";v="99", "Chromium";v="87"',
      'sec-ch-ua-mobile': '?0',
      'Upgrade-Insecure-Requests': '1',
      'Origin': 'https://shop.yaguar.com.ar',
      'Content-Type': 'application/x-www-form-urlencoded',
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/87.0.4280.88 Safari/537.36',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9',
      'Sec-Fetch-Site': 'same-origin',
      'Sec-Fetch-Mode': 'navigate',
      'Sec-Fetch-User': '?1',
      'Sec-Fetch-Dest': 'document',
      'Referer': 'https://shop.yaguar.com.ar/frontendSP/asp/home.asp',
      'Accept-Language': 'es-US,es;q=0.9,en-GB;q=0.8,en;q=0.7,es-419;q=0.6',
  }

  data = {
    'Login': 'msebastiant@hotmail.com',
    'Password': '20219202335'
  }

  session.post('https://shop.yaguar.com.ar/common/asp/login.asp', headers=headers, cookies=cookies, data=data)
  response = session.get('https://shop.yaguar.com.ar/frontendSP/asp/iframe_ListadoDeProductos.asp?tipoBusqueda=nombremarca&txtBusqueda=' + busqueda)

  return response.content

@app.route('/maxiconsumo/<busqueda>', methods=['GET'])
def getMaxiconsumo(busqueda):
  session = requests.session()
  response = session.get('https://maxiconsumo.com/sucursal_capital/catalogsearch/result/index/?q=' + busqueda + '&product_list_limit=24')
  return response.content


if __name__ == '__main__':
  app.run()