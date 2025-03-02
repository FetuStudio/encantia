const handlePasswordReset = async () => {
    try {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: "https://encantia.lat/reset-password"
        });
        if (error) throw error;
        setResetMessage("Se ha enviado un correo para restablecer tu contraseña.");
    } catch (e) {
        setErrorMessage(e.message);
    }
};
