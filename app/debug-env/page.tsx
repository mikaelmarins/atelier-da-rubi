
export default function DebugEnvPage() {
    const token = process.env.MP_ACCESS_TOKEN;
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;

    return (
        <div className="p-10">
            <h1>Debug Env</h1>
            <p>MP_ACCESS_TOKEN exists: {token ? "YES" : "NO"}</p>
            <p>MP_ACCESS_TOKEN length: {token ? token.length : 0}</p>
            <p>MP_ACCESS_TOKEN start: {token ? token.substring(0, 10) : "N/A"}</p>
            <p>NEXT_PUBLIC_BASE_URL: {baseUrl}</p>
        </div>
    );
}
