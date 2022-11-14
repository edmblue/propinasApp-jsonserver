

const guardarCliente = document.querySelector('#guardar-cliente');
const modal = new bootstrap.Modal('#formulario');
const formulario = document.querySelector('form');

let cliente = {
  mesa: '',
  hora: '',
  pedidos: [],
};

//EventListeners

callEventListeners();

function callEventListeners() {
  guardarCliente.addEventListener('click', submitCliente);
}

function submitCliente() {
  const mesa = document.querySelector('#mesa').value;
  const hora = document.querySelector('#hora').value;

  const formularioVacio = [mesa, hora].some(
    (itemCliente) => itemCliente === ''
  );

  if (formularioVacio) {
    mostrarMensaje('Rellene todos los campos');
    return;
  }

  cliente = { ...cliente, mesa, hora };

  const divOcultos = document.querySelectorAll('.d-none');

  divOcultos.forEach((div) => {
    div.classList.remove('d-none');
  });

  llenarPlatillosHTML();

  formulario.reset();

  modal.hide();
}

function llenarPlatillosHTML() {
  fetch('https://my-json-server.typicode.com/edmblue/propinasApp-jsonserver/platillos')
    .then((respuesta) => respuesta.json())
    .then((resultado) => llenarPlatillos(resultado));
}

function llenarPlatillos(platillos) {
  const fragment = new DocumentFragment();
  const contenido = document.querySelector('#platillos .contenido');
  const categorias = {
    1: 'Comida',
    2: 'Bebida',
    3: 'Postre',
  };

  platillos.forEach((platillo) => {
    const { nombre, precio, categoria, id } = platillo;
    const template = document.querySelector('.lista-platillos').content;
    const listaPlatillosTemplate = template.cloneNode(true);
    const nombrePlatillo =
      listaPlatillosTemplate.querySelector('.nombre-platillo');
    const precioPlatillo =
      listaPlatillosTemplate.querySelector('.precio-platillo');
    const categoriaPlatillo = listaPlatillosTemplate.querySelector(
      '.categoria-platillo'
    );
    const cantidadPlatillo =
      listaPlatillosTemplate.querySelector('.cantidad-platillo');
    const platilloCantidadInput = listaPlatillosTemplate.querySelector('input');

    nombrePlatillo.textContent = nombre;
    precioPlatillo.textContent = `$${precio}`;
    categoriaPlatillo.textContent = categorias[categoria];
    cantidadPlatillo.id = `platillo-${id}`;
    platilloCantidadInput.onchange = () => {
      llenarPedido(platillo, platilloCantidadInput.value);
    };

    fragment.appendChild(listaPlatillosTemplate);
  });

  contenido.appendChild(fragment);
}

function llenarPedido(platilloAAgregar, cantidadNumero) {
  if (parseInt(cantidadNumero) === 0) {
    cliente.pedidos = cliente.pedidos.filter(
      (pedido) => pedido.id !== platilloAAgregar.id
    );

    mostrarPedidoHTML(cliente.pedidos);
    return;
  }

  const existe = cliente.pedidos.some(
    (pedido) => pedido.id === platilloAAgregar.id
  );

  if (existe) {
    cliente.pedidos = cliente.pedidos.map((pedido) => {
      if (pedido.id === platilloAAgregar.id) {
        pedido.cantidad = parseInt(cantidadNumero);
        return pedido;
      } else {
        return pedido;
      }
    });
    mostrarPedidoHTML(cliente.pedidos);
    return;
  }

  let cantidad = 1;

  cliente.pedidos = [...cliente.pedidos, { ...platilloAAgregar, cantidad }];

  mostrarPedidoHTML();
}

function mostrarPedidoHTML() {
  if (cliente.pedidos.length === 0) {
    pedidosNulos();

    return;
  }

  limpiarHTML();
  const contenido = document.querySelector('#resumen .contenido');
  const fragment = new DocumentFragment();
  const template = document.querySelector('.platillos-pedidos').content;
  const platillosPedidos = template.cloneNode(true);
  const { mesa, hora, pedidos } = cliente;

  platillosPedidos.querySelector('.mesa-numero span').textContent = mesa;
  platillosPedidos.querySelector('.hora span').textContent = hora;

  pedidos.forEach((pedido) => {
    const { nombre, cantidad, precio, id } = pedido;
    const templateItem = document.querySelector('.items-list').content;
    const listaPedidos = templateItem.cloneNode(true);

    listaPedidos.querySelector('h4').textContent = nombre;
    listaPedidos.querySelector('.item-cantidad span').textContent = cantidad;
    listaPedidos.querySelector('.item-precio span').textContent = `$${precio}`;
    listaPedidos.querySelector('.item-subtotal span').textContent =
      precio * cantidad;
    listaPedidos.querySelector('button').onclick = () => {
      eliminarItem(id);
    };

    fragment.appendChild(listaPedidos);
  });

  platillosPedidos.querySelector('.list-group').appendChild(fragment);
  contenido.appendChild(platillosPedidos);

  calcularPropina();
}

function calcularPropina() {
  const contenido = document.querySelector('#resumen .contenido');
  const templatePropinas = document.querySelector('.calcular-propina').content;
  const listaTotalAPagar = templatePropinas.cloneNode(true);

  listaTotalAPagar.querySelector('.total-comida span').textContent =
    '$' + calcularTotalPedidos();
  listaTotalAPagar
    .querySelectorAll('input[name="propina"]')
    .forEach((input) => {
      input.onclick = () => {
        calcularCantidades(parseInt(input.value));
      };
    });

  contenido.appendChild(listaTotalAPagar);
}

function calcularTotalPedidos() {
  const { pedidos } = cliente;

  return pedidos.reduce((total, pedido) => {
    const { cantidad, precio } = pedido;

    return (total += cantidad * precio);
  }, 0);
}

function calcularCantidades(porcentaje) {
  let totalPropinas = (porcentaje / 100) * calcularTotalPedidos();

  const parrafoPropinas = document.querySelector('.total-propina span');

  parrafoPropinas.textContent = '$' + totalPropinas;

  let totalAPagar = totalPropinas + calcularTotalPedidos();

  const parrafoTotal = document.querySelector('.total-pagar span');

  parrafoTotal.textContent = '$' + totalAPagar;
}

function eliminarItem(idAEliminar) {
  cliente.pedidos = cliente.pedidos.filter(
    (pedido) => pedido.id !== idAEliminar
  );

  const valueUpdate = document.querySelector(`#platillo-${idAEliminar} input`);
  valueUpdate.value = 0;

  if (cliente.pedidos.length === 0) {
    pedidosNulos();
    return;
  }

  mostrarPedidoHTML();
}

function pedidosNulos() {
  limpiarHTML();

  const textNone = document.createElement('P');
  textNone.classList.add('text-center');
  textNone.textContent = 'Añade los elementos del pedido';
  const contenido = document.querySelector('#resumen .contenido');
  contenido.appendChild(textNone);

  return;
}

function limpiarHTML() {
  const contenido = document.querySelector('#resumen .contenido');
  while (contenido.firstChild) {
    contenido.removeChild(contenido.firstChild);
  }
}

function mostrarMensaje(mensaje) {
  const mensajeExiste = document.querySelector('.bg-danger');

  if (!mensajeExiste) {
    const modalBody = document.querySelector('.modal-body');
    const mensajeRow = document.createElement('P');
    mensajeRow.textContent = mensaje;
    mensajeRow.classList.add(
      'bg-danger',
      'text-center',
      'fw-bold',
      'text-white',
      'my-2',
      'py-2'
    );

    modalBody.appendChild(mensajeRow);

    setTimeout(() => {
      mensajeRow.remove();
    }, 2000);
  }
}
