from pathlib import Path
import re
from playwright.sync_api import sync_playwright
root=Path(__file__).resolve().parents[1]
qa=root/'qa';qa.mkdir(exist_ok=True)
with sync_playwright() as p:
  browser=p.chromium.launch(executable_path='/usr/bin/chromium',headless=True,args=['--no-sandbox','--disable-dev-shm-usage'])
  context=browser.new_context(viewport={'width':1480,'height':960},accept_downloads=True)
  page=context.new_page();errors=[]
  page.on('pageerror',lambda err: errors.append(str(err)))
  page.route('**/fonts.googleapis.com/**',lambda route:route.abort())
  page.route('**/fonts.gstatic.com/**',lambda route:route.abort())
  page.route('**/cdnjs.cloudflare.com/**',lambda route:route.abort())
  uri=(root/'dist'/'ABRIR_VOLTAGE_OBRAS_V7.html').as_uri()
  portable_html=(root/'dist'/'ABRIR_VOLTAGE_OBRAS_V7.html').read_text()
  scripts=[s for s in re.findall(r'<script(?: [^>]*)?>(.*?)</script>',portable_html,re.S) if s.strip()]
  assert len(scripts)==5,len(scripts)
  markup=re.sub(r'<script(?: [^>]*)?>.*?</script>','',portable_html,flags=re.S)
  page.set_content(markup,wait_until='domcontentloaded')
  page.evaluate("""() => {let bag={}; Object.defineProperty(window,'localStorage',{configurable:true,value:{getItem(k){return bag[k]??null},setItem(k,v){bag[k]=String(v)},removeItem(k){delete bag[k]}}})}""")
  for code in scripts:page.add_script_tag(content=code)
  page.wait_for_timeout(900)
  assert not errors,errors
  assert page.locator('#v-panel').is_visible()
  assert page.locator('#nav button[data-go="panel"]').is_visible()
  assert page.locator('#v5-current').inner_text()=='Inicio'
  assert page.locator('#v-panel').get_by_text('Facturación',exact=False).count()>0
  print('Portable OK; first heading:',page.locator('#v-panel h1').first.inner_text())
  assert page.locator('.side').evaluate('(e)=>getComputedStyle(e).backgroundColor') == 'rgb(20, 26, 27)'
  assert page.locator('.app main').evaluate('(e)=>getComputedStyle(e).backgroundColor') == 'rgb(255, 255, 255)'
  page.screenshot(path=str(qa/'INICIO_V7.png'),full_page=True)
  nav=['flujo','cotizaciones','facturas','tributario','proyectos','clientes','costos','reportes','integraciones','config']
  for area in nav:
    page.locator(f'#nav button[data-go="{area}"]').click()
    page.wait_for_timeout(45)
    assert page.locator(f'#v-{area}').is_visible(),f'not visible {area}'
    assert not errors,(area,errors)
  print('Navigation',len(nav),'sections OK')
  page.locator('#nav button[data-go="proyectos"]').click()
  assert page.locator('#v-proyectos').is_visible()
  page.screenshot(path=str(qa/'PROYECTOS_V7.png'),full_page=False)
  page.locator('#nav button[data-go="tributario"]').click()
  assert page.locator('[data-v6-tax-check]').count()>0
  page.locator('[data-v6-tax-check]').first.click()
  assert page.locator('#m-body').get_by_text('RUT del emisor válido').count()==1
  page.locator('#m-a0').click()
  with page.expect_download(timeout=12000) as dli:page.locator('[data-v6-tax-pdf]').first.click()
  d=dli.value; d.save_as(qa/'FICHA_SII_V7.pdf')
  assert (qa/'FICHA_SII_V7.pdf').read_bytes().startswith(b'%PDF-')
  page.locator('#nav button[data-go="reportes"]').click()
  assert page.locator('[data-v4-pdf="project"]').count()>0
  with page.expect_download(timeout=12000) as dli:page.locator('[data-v4-pdf="project"]').first.click()
  d=dli.value; d.save_as(qa/'REPORTE_PROYECTO_V7.pdf')
  assert (qa/'REPORTE_PROYECTO_V7.pdf').read_bytes().startswith(b'%PDF-')
  page.locator('#nav button[data-go="panel"]').click()
  page.locator('#v6-notif-trigger').click()
  assert page.locator('#v6-notif-menu').is_visible()
  print('Notifications',page.locator('[data-v6-open-notif]').count())
  assert not errors,errors
  # Complete folder version (not portable)
  second=context.new_page();errors2=[];second.on('pageerror',lambda e:errors2.append(str(e)))
  second.route('**/fonts.googleapis.com/**',lambda route:route.abort())
  second.route('**/fonts.gstatic.com/**',lambda route:route.abort())
  second.route('**/cdnjs.cloudflare.com/**',lambda route:route.abort())
  folder=(root/'dist'/'index.html').read_text()
  folder=re.sub(r'<script[^>]*>.*?</script>','',folder,flags=re.S)
  folder=re.sub(r'<link rel="stylesheet" href="./assets/app.css">','<style>'+ (root/'dist/assets/app.css').read_text() + '</style>',folder)
  second.set_content(folder,wait_until='domcontentloaded')
  second.evaluate("""() => {let bag={}; Object.defineProperty(window,'localStorage',{configurable:true,value:{getItem(k){return bag[k]??null},setItem(k,v){bag[k]=String(v)},removeItem(k){delete bag[k]}}})}""")
  for filename in ['demo-data.js','local-adapter.js','pdf-fallback.js','report-pdf.js','app.js']:
    second.add_script_tag(content=(root/'dist/assets'/filename).read_text())
  second.wait_for_timeout(700)
  assert not errors2,errors2
  assert second.locator('#v-panel').is_visible()
  print('Folder mode OK')
  mob=browser.new_context(viewport={'width':390,'height':844},device_scale_factor=1)
  m=mob.new_page();me=[];m.on('pageerror',lambda e:me.append(str(e)))
  m.route('**/fonts.googleapis.com/**',lambda route:route.abort())
  m.route('**/fonts.gstatic.com/**',lambda route:route.abort())
  m.route('**/cdnjs.cloudflare.com/**',lambda route:route.abort())
  m.set_content(markup,wait_until='domcontentloaded')
  m.evaluate("""() => {let bag={}; Object.defineProperty(window,'localStorage',{configurable:true,value:{getItem(k){return bag[k]??null},setItem(k,v){bag[k]=String(v)},removeItem(k){delete bag[k]}}})}""")
  for code in scripts:m.add_script_tag(content=code)
  m.wait_for_timeout(600)
  assert not me,me
  m.screenshot(path=str(qa/'MOVIL_V7.png'),full_page=True)
  print('Mobile OK, V7 QA PASS',flush=True)
  browser.close()
