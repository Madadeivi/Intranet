// Ejemplo de función para hacer peticiones a una API
export async function fetchData(url: string) {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error('Error al obtener los datos');
  }
  return response.json();
}
