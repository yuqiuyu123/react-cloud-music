const path = require("path")
const MiniCssExtractPlugin = require("mini-css-extract-plugin")

module.exports = {
    //入口
    entry:{
        app:'./src/index'
    },
    // 添加resolve
    resolve: {
        extensions: ['.ts', '.tsx', '.js']
    },
    output:{
        path:path.resolve(__dirname,"../dist"),
        filename:'js/[name].[hash].js',
        publicPath:"/" //打包后的资源的访问路径前缀
    },
    module:{
        rules:[
            {
                test:/\.(js|jsx)$/,
                exclude:/node_modules/, // 这个node_modules文件夹里面的js/jsx文件不需要使用babel-loader
                // babel-loader的参数配置也可以这样写，我们这里是新建一个.babelrc文件的方式来配置
                use: {  
                    loader: 'babel-loader',
                    options: {
                    presets: ['@babel/preset-env']
                    }
                }
            },
            {
                test: /\.(js|jsx)$/,
                use: ['eslint-loader'],
                exclude: [/node_modules/],
                enforce: 'pre'
            },
            {
                test:/\.css$/,
                use:[
                   {
                      loader:MiniCssExtractPlugin.loader,
                      options:{
                          hmr:true,
                          reloadAll:true
                      }
                    },
                    //  {
                    //      loader:"style-loader"
                    //  },
                    {
                        loader:"css-loader"
                    }
                ]
            },
            {
                test:/\.less$/,
                use:[
                    //  {
                    //      loader:"style-loader"
                    //  },
                    {
                      loader:MiniCssExtractPlugin.loader,
                      options:{
                          hmr:true,
                          reloadAll:true
                      }
                    },
                    {
                        loader:"css-loader"
                    },
                    {
                        loader:"less-loader"
                    }
                ]
            },
            {
                test: /\.(png|jpg|gif)$/,
                use: [{
                    loader: 'url-loader',
                    options: {
                        limit: 10000,//以字节为单位，小于该大小的图片编译成base64
                        name:'images/[name]-[hash].[ext]',//所有图片打包到images目录
                    }
                }]
            },
            {
                test: /\.tsx?$/,
                use: 'ts-loader',
                exclude: /node_modules/
            }
        ]
    },
    plugins:[
        // 会导致项目eslint校验失败挂掉
    //   function() {
    //     this.hooks.done.tap('done', (stats) => {
    //       if (stats.compilation.errors && stats.compilation.errors.length && process.argv.indexOf('--watch') == -1) {
    //         process.exit(1);
    //       }
    //     })
    //   },
      new MiniCssExtractPlugin({
        filename:'css/[name].css',
        chunkFilename:'css/[id].css'
      })
    ],
    stats: 'errors-only'
    
}