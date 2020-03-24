const {override, fixBabelImports, addLessLoader}=require('customize-cra');

module.exports=override(
    fixBabelImports('import', {
        libraryName: 'antd',
        libraryDirectory: 'es',
        style: true,
    }),
    addLessLoader({
        javascriptEnabled: true,
        modifyVars: {
            'border-radius-base': '4px',
            'box-shadow-base': '0 1px 6px rgba(0, 0, 0, 0.2), 0 3px 12px 0 rgba(0, 0, 0, 0.08)',
            'carousel-dot-height': '5px',
            'animation-duration-slow': '.2s', // modal
            'animation-duration-base': '.14s', // popover
            'animation-duration-fast': '.08s', // tooltip
        },
    }),
);
