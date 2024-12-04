import { PlaywrightTestConfig } from '@playwright/test';

const config: PlaywrightTestConfig = {
  testDir: './tests',
  testMatch: ['playwright.test.ts'],
  
  /* 超时配置 */
  timeout: 30000,           // 全局超时时间
  expect: {
    timeout: 5000,         // 断言超时时间
  },

  /* 重试配置 */
  retries: process.env.CI ? 2 : 0,  // CI 环境下重试2次，本地开发不重试

  /* 并发配置 */
  workers: process.env.CI ? 1 : undefined,  // CI 环境下串行执行，本地开发并行执行
  fullyParallel: !process.env.CI,           // CI 环境下禁用完全并行

  /* 报告配置 */
  reporter: [
    ['list'],                // 控制台列表形式展示
    ['html', { open: 'never' }]  // HTML 报告
  ],

  /* 浏览器配置 */
  use: {
    headless: true,
    viewport: { width: 1280, height: 720 },
    ignoreHTTPSErrors: true,
    
    /* 追踪配置，用于调试 */
    trace: process.env.CI ? 'retain-on-failure' : 'off',  // CI 环境下失败时保存追踪
    screenshot: process.env.CI ? 'only-on-failure' : 'off',  // CI 环境下失败时截图
    video: process.env.CI ? 'retain-on-failure' : 'off',    // CI 环境下失败时保存视频
  },

  /* 项目配置 */
  projects: [
    {
      name: 'chromium',
      use: { 
        browserName: 'chromium',
        launchOptions: {
          args: ['--disable-dev-shm-usage']  // 防止 CI 环境中的内存问题
        }
      },
    },
    {
      name: 'firefox',
      use: { browserName: 'firefox' },
    },
  ],

  /* 输出配置 */
  outputDir: 'test-results',  // 测试结果输出目录
}

export default config;
