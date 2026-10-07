const backendUrl = 'http://localhost:4200//api/v1/health';

async function checkBackendConnection() {
  console.log(`Comprobando conexión con ${backendUrl}...`);

  try {
    const response = await fetch(backendUrl);

    if (response.ok) {
      console.log(`Conexión correcta (HTTP ${response.status}).`);
      return;
    }

    console.error(`El backend respondió con HTTP ${response.status}.`);
    process.exitCode = 1;
  } catch (error) {
    console.error('No se pudo conectar con el backend.');
    console.error(error.message);
    process.exitCode = 1;
  }
}

checkBackendConnection();
