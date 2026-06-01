export const validateResource = (schema) => (req, res, next) => {
    try {
        schema.parse({
            body: req.body,
            query: req.query,
            params: req.params,
        });
        next();
    } catch (err) {
        const errorMessage = err.errors.map(e => e.message).join(', ');
        return res.status(400).json({ error: errorMessage });
    }
};