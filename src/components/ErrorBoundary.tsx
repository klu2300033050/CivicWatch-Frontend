import React from "react";

interface State { hasError: boolean; error: Error | null }

export class ErrorBoundary extends React.Component<{ children: React.ReactNode }, State> {
    state: State = { hasError: false, error: null };

    static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, info: React.ErrorInfo) {
        console.error("React ErrorBoundary caught:", error, info);
    }

    render() {
        if (this.state.hasError) {
            return (
                <div style={{
                    minHeight: "100vh", display: "flex", flexDirection: "column",
                    alignItems: "center", justifyContent: "center",
                    background: "#060f1e", color: "#fff", fontFamily: "Inter, sans-serif", padding: 32,
                }}>
                    <div style={{ fontSize: 40, marginBottom: 16 }}>⚠️</div>
                    <h1 style={{ fontSize: 22, fontWeight: 700, marginBottom: 8, color: "#f5a623" }}>
                        Something went wrong
                    </h1>
                    <p style={{ fontSize: 14, color: "#94a3b8", marginBottom: 24, textAlign: "center", maxWidth: 480 }}>
                        {this.state.error?.message || "An unexpected error occurred."}
                    </p>
                    <button
                        onClick={() => { this.setState({ hasError: false, error: null }); window.location.reload(); }}
                        style={{
                            background: "#f5a623", color: "#1e293b", border: "none", borderRadius: 12,
                            padding: "10px 24px", fontWeight: 700, fontSize: 14, cursor: "pointer",
                        }}
                    >
                        Reload Page
                    </button>
                </div>
            );
        }
        return this.props.children;
    }
}
