INSERT INTO site_config (key, value)
VALUES (
  'catalog_sections',
  '[{"id":"tech","title":"Catálogo","subtitle":"Equipamiento Premium Seleccionado","image":"https://images.pexels.com/photos/100650/pexels-photo-100650.jpeg?auto=compress&cs=tinysrgb&w=1600","year":"2024","categories":["Todos","Audio","Cierre Centralizado","Levantacristales","Lámparas","Cámaras","Sensores"],"recommendedTags":["hotsale"]},{"id":"mobile","title":"Celulares","subtitle":"Equipos y Accesorios","image":"https://images.pexels.com/photos/11297769/pexels-photo-11297769.jpeg","year":"2024","categories":["Todos","Celulares","Cargador","Fundas"],"recommendedTags":["new"]},{"id":"clothes","title":"Indumentaria","subtitle":"Tendencias de temporada","image":"https://images.pexels.com/photos/4903412/pexels-photo-4903412.jpeg","year":"2024","categories":["Todos","Remeras","Buzos","Pantalones Cortos","Pantalones Largos"],"recommendedTags":["hotsale"]}]'
)
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;