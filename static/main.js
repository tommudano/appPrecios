const DataCtrl = (function() {
    const Data = {
        dataCoto: {},
        dataCarrefour: {},
        dataYaguar: {},
        dataMaxiconsumo: {}
    };

    return {
        getData: () => {
            return Data;
        }
    };
})();

const App = (function(DataCtrl) {
    const Data = DataCtrl.getData();

    const loadEventListeners = () => {
        document.querySelector('#formBusqueda').addEventListener("submit", cargarDatos);
    }

    const buscar = async busqueda => {
        await coto(busqueda);
        // await carrefour(busqueda);
        await yaguar(busqueda);
        await maxiconsumo(busqueda);
    }

    const cambiarEstadoCargando = () => {
        let btn = document.querySelector("#btn");
        let loader = document.querySelector("#loader");

        if (btn.disabled == true) {
            btn.disabled = false;
            loader.style.display = 'none';
        } else {
            btn.disabled = true;
            loader.style.display = 'block';
        }
    }

    const cargarDatos = async e => {
        cambiarEstadoCargando();
        e.preventDefault();
        let busqueda = e.target.querySelector("#busqueda").value;
        let coincidencia = e.target.querySelector("#coincidencia").value;
        coicidencia = parseFloat(coincidencia);
        coincidencia != null && coincidencia != 0 ? coincidencia : coincidencia = 0.5;
        await buscar(busqueda);
        generarResultado(coincidencia);
    }

    const mostrarResultados = res => {
        let resultadosSection = document.querySelector("#resultados");
        let table = document.createElement('table');
        table.classList  = 'table mt-3 table-striped table-hover';
        let html = `
            <thead class="thead-dark">
                <tr>
                    <th scope="col">Coto</th>
                    <th scope="col">Carrefour</th>
                    <th scope="col">Yaguar</th>
                    <th scope="col">Maxiconsumo</th>
                </tr>
            </thead>
            <tbody>
        `;
        
        res.forEach(data => {
            html += '<tr>';
            data.forEach((item, index) => {
                if (item != undefined) {
                    html += `<td>${data[index].nombre}: <strong>${data[index].precio}</strong></td>`;
                } else {
                    html += `<td><i>No se pudo encontrar coincidencia en este mercado</i></td>`;
                }
            });
            html += '</tr>';
        });

        html += '</tbody>';

        table.innerHTML = html;
        resultadosSection.innerHTML = '';
        resultadosSection.appendChild(table);
        cambiarEstadoCargando();
    } 

    const generarResultado = coincidencia => {
        let [coto, carrefour, yaguar, maxiconsumo] = [Data.dataCoto, Data.dataCarrefour, Data.dataYaguar, Data.dataMaxiconsumo];
        let res1 = filterData(coto, carrefour, coincidencia);
        let res2 = filterData(coto, yaguar, coincidencia);
        let res3 = filterData(coto, maxiconsumo, coincidencia);
        let resultadoFinal = [];
        for (let i = 0; i < coto.length; i++) {
            if (res1[i][1] != undefined || res2[i][1] != undefined || res3[i][1] != undefined) {
                resultadoFinal.push([coto[i], res1[i][1], res2[i][1], res3[i][1]]);
            }
        }
        mostrarResultados(resultadoFinal);
    }
    
    const filterData = (arr1, arr2, coincidencia) => {
        let resultados = [];
        let k;
        for (k = 0; k < arr1.length; k++) {
            let i;
            let res = [];
            let toTest = arr1[k].nombre.split(" ");

            for (i = 0; i < arr2.length; i++) {
                let j;
                let toCompare = arr2[i].nombre.split(" ");
                let cont = 0;
                for (j = 0; j < toTest.length; j++) {
                    if (toCompare.find(item => item.includes(toTest[j])) != undefined) {
                        cont++;
                    }
                }
                res.push(cont);
            }
            let maxCoincidencia = max(res)
            if (maxCoincidencia / toTest.length > coincidencia) {
                let coincidencia = res.indexOf(maxCoincidencia);
                resultados.push([arr1[k],arr2[coincidencia]]);
            } else {
                resultados.push([]);
            }
        }
        return resultados;
    }

    const max = arr => {
        let max = arr[0];
        let i = arr.length;
            
        while (i--) {
            max = arr[i] > max ? arr[i] : max;
        }
        return max;
    }

    const coto = async busqueda => {
        try {
            let response = await fetch(`https://www.cotodigital3.com.ar/sitios/cdigi/browse;jsessionid=?_dyncharset=utf-8&Ntt=${busqueda}`);
            let data = await response.text();
            if (data.indexOf("No se han encontrado art") == -1) {
                data = data.substring(data.indexOf("<ul id=\"products\""));
                data = data.split("</ul>")[0];
                let doc = new DOMParser().parseFromString(data, 'text/html');
                let finalData = parseCoto(doc.body.querySelectorAll('li'));
                Data.dataCoto = finalData;
            }
        } catch (err) {
            console.log(err);
        }
    }

    const parseCoto = data => {
        productos = [];
        
        data.forEach(li => {
            let producto = {};
            
            let prodText = li.querySelector(".leftList").lastElementChild.querySelector('a').lastElementChild.firstElementChild.firstElementChild.firstElementChild;
            
            if (prodText.firstChild.textContent.trim() == '') {
                producto.nombre = prodText.firstElementChild.textContent.trim().toLowerCase();
            } else {
                producto.nombre = prodText.firstChild.textContent.trim().toLowerCase();
            }

            let prodIni = li.querySelector(".rightList").firstElementChild.firstElementChild;
            if (prodIni.querySelector(".product_discount_container")) {
                prod = prodIni.firstElementChild.firstElementChild;
                if (prod.lastElementChild.innerHTML.indexOf('span') != -1) {
                    prod = prod.lastElementChild.lastElementChild;
                    if (prod != '' && prod != null && prod.classList.contains("price_discount")) {
                        producto.precio = prod.textContent;
                    } else {
                        producto.precio = prod.firstElementChild.lastChild.textContent.trim()
                    }
                } else {
                    producto.precio = prod.lastChild.textContent.trim();
                }
            } else {
                producto.precio = prodIni.firstElementChild.firstElementChild.lastChild.textContent.trim();
            }

            productos.push(producto);
        });

        return productos;
    }

    const carrefour = async busqueda => {
        const proxyurl = "https://cors-anywhere.herokuapp.com/";
        try {
            let url = `https://supermercado.carrefour.com.ar/catalogsearch/result/?q=${busqueda}`; 
            let response = await fetch(proxyurl + url);
            let data = await response.text();
            if (data.indexOf("Este producto se perdi") == -1) {
                let doc = new DOMParser().parseFromString(data, 'text/html');
                let dataDec = doc.querySelectorAll(".home-product-cards > .row > .product-card");
                let finalData = parseCarrefour(dataDec);
                Data.dataCarrefour = finalData;
            }
        } catch (err) {
            console.log(err);
        }
    }

    const parseCarrefour = data => {
        let productos = [];
        
        data.forEach(div => {
            let producto = {};
            
            let dataName = div.querySelector(".title-food").textContent.trim().toLowerCase();
            producto.nombre = dataName;
            
            let dataPrice = div.querySelector(".price-box").firstElementChild;
            if (dataPrice.firstElementChild == null) {
                producto.precio = dataPrice.textContent.trim();
            } else {
                producto.precio = dataPrice.firstElementChild.textContent.trim();
            }
            
            productos.push(producto);
        });
        
        return productos;
    }

    const yaguar = async busqueda => {
        try {
            let response = await fetch(`/yaguar/${busqueda}`, {
                method  : 'GET',
                headers : {
                    'Content-Type': 'text/html'
                }
            });
            let data = await response.text();
            if (data.indexOf("No se han encontrado") == -1) {
                let doc = new DOMParser().parseFromString(data, 'text/html');
                let dataDec = doc.querySelector("table > tbody").firstElementChild.nextElementSibling.nextElementSibling.firstElementChild.firstElementChild.querySelectorAll(':scope > tbody > tr');
                let finalData = parseYaguar(dataDec);
                Data.dataYaguar = finalData;
            }
        } catch (err) {
            console.log(err);
        }
    }

    const parseYaguar = data => {
        let filteredData = [...data].filter(item=>item.firstElementChild.textContent.trim() != '');
        let productos = [];

        filteredData.forEach(item => {
            let producto = {};
            let nombreItem = item.querySelector('.tcgrisoscuro').textContent.trim().toLowerCase();
            let precioItem = item.querySelector('.sfPRODPRECIOA').textContent.trim();
            producto.nombre = nombreItem;
            producto.precio = precioItem;

            productos.push(producto);
        });

        return productos;
    }

    const maxiconsumo = async busqueda => {
        try {
            let response = await fetch(`/maxiconsumo/${busqueda}`, {
                method  : 'GET',
                headers : {
                    'Content-Type': 'text/html'
                }
            });
            let data = await response.text();
            if (data.indexOf("no ha devuelto") == -1) {
                let doc = new DOMParser().parseFromString(data, 'text/html');
                let dataDec = doc.querySelectorAll(".products > ul > li");
                let finalData = parseMaxiconsumo(dataDec);
                Data.dataMaxiconsumo = finalData;
            }
        } catch (err) {
            console.log(err);
        }
    }

    const parseMaxiconsumo = data => {
        let productos = [];

        data.forEach(item => {
            let producto = {};
            let depuratedData = item.querySelector(".item-inner > .product");

            let nombreItem = depuratedData.querySelector(".name-rating a").textContent.trim().toLowerCase();

            let precioItem;
            if (depuratedData.childElementCount != 1) {
                precioItem = depuratedData.querySelector(".highest .price-container").firstElementChild.nextElementSibling.firstElementChild.textContent.trim();
            } else {
                precioItem = "No hay información por falta de stock";
            }

            producto.nombre = nombreItem;
            producto.precio = precioItem;
            productos.push(producto);
        }); 
        
        return productos;
    }

    return {
        init: () => {
            loadEventListeners();
        }
    }
})(DataCtrl);

document.addEventListener('DOMContentLoaded', App.init);

    
    
    


    