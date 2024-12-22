const browserSync = require('browser-sync');

// Start Browser-Sync and proxy your Node server
browserSync.init({
    proxy: 'http://localhost:4000', // Replace PORT with your app's port
    files: ['views/**/*.hbs', 'public/**/*.*'], // Watch these files for changes
    open: false, // Set to true if you want the browser to open automatically
    port: 3000, // Port for the UI
});
