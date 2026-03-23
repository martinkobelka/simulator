// ANSI escape codes for terminal color output
const COLORS = {
    reset: '\x1b[0m',
    gray: '\x1b[90m',
    cyan: '\x1b[36m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    red: '\x1b[31m',
    magenta: '\x1b[35m',
    blue: '\x1b[34m',
};

function timestamp() {
    return new Date().toLocaleTimeString('cs-CZ', {hour12: false});
}

// Formats and prints a log line: [HH:MM:SS] [TAG] message  detail
function log(color, tag, message, detail = '') {
    const ts = `${COLORS.gray}[${timestamp()}]${COLORS.reset}`;
    const label = `${color}[${tag}]${COLORS.reset}`;
    const det = detail ? ` ${COLORS.gray}${detail}${COLORS.reset}` : '';
    console.log(`${ts} ${label} ${message}${det}`);
}

const logger = {
    connect: (detail) => log(COLORS.green, 'CONNECT', 'Client connected', detail),
    disconnect: (detail) => log(COLORS.yellow, 'DISCONNECT', 'Client disconnected', detail),
    recv: (type, detail) => log(COLORS.cyan, 'RECV', type, detail),       // incoming WS message
    send: (type, detail) => log(COLORS.blue, 'SEND', type, detail),        // unicast to one client
    broadcast: (type, detail) => log(COLORS.magenta, 'BROADCAST', type, detail), // sent to all clients
    engine: (msg, detail) => log(COLORS.green, 'ENGINE', msg, detail),
    warn: (msg) => log(COLORS.yellow, 'WARN', msg),
    error: (msg) => log(COLORS.red, 'ERROR', msg),
};

module.exports = logger;
