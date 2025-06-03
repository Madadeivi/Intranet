export default function Home() {
  return (
    <div className="container">
      <h1>Intranet Coacharte</h1>
      <p>API Status: Running</p>
      <div>
        <h2>API Endpoints:</h2>
        <ul>
          <li><a href="/api/health">/api/health</a> - Health check</li>
          <li>/api/users/login - Login endpoint</li>
        </ul>
      </div>
    </div>
  );
}