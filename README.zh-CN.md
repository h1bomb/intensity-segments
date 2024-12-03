# 强度分段管理器

[![CI](https://github.com/h1bomb/intensity-segments/actions/workflows/ci.yml/badge.svg)](https://github.com/h1bomb/intensity-segments/actions/workflows/ci.yml)
[![codecov](https://codecov.io/github/h1bomb/intensity-segments/graph/badge.svg?token=1DP6kKsrGG)](https://codecov.io/github/h1bomb/intensity-segments)
[![npm version](https://badge.fury.io/js/intensity-segments.svg)](https://badge.fury.io/js/intensity-segments)

[English](./README.md) | 简体中文

一个用于管理时间轴上强度分段的 TypeScript 库。该库提供了一种强大的方式来处理重叠的强度变化，并维护强度值的清晰、高效的表示。

## 特性

- 为特定时间范围添加强度变化
- 为时间范围设置绝对强度值
- 自动处理重叠分段
- 维护高效的分段表示
- 支持正负强度值

## 安装

使用 npm：

```bash
npm install intensity-segments
```

或者使用 yarn：

```bash
yarn add intensity-segments
```

## 使用方法

```typescript
import { IntensitySegmentManager } from 'intensity-segments';

// 创建一个新的分段管理器实例
const manager = new IntensitySegmentManager();

// 添加强度分段
manager.addSegment({
  startTime: 0,
  endTime: 5,
  intensity: 1.0
});

// 获取特定时间点的强度值
const intensity = manager.getIntensityAt(2.5); // 返回 1.0
```

## API 文档

### IntensitySegmentManager

主要的分段管理器类。

#### 方法

- `addSegment(segment: Segment): void`
  添加一个新的强度分段。

- `getIntensityAt(time: number): number`
  获取指定时间点的强度值。

- `clear(): void`
  清除所有分段。

### Segment 接口

```typescript
interface Segment {
  startTime: number;  // 分段开始时间
  endTime: number;    // 分段结束时间
  intensity: number;  // 强度值
}
```

## 贡献指南

欢迎贡献！请随时提交问题或拉取请求。

1. Fork 这个仓库
2. 创建你的特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交你的更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启一个 Pull Request

## 许可证

该项目基于 MIT 许可证授权 - 查看 [LICENSE](LICENSE) 文件了解详情。

## 项目结构

```
intensity-segments/
├── src/           # 源代码
├── tests/         # 测试文件
├── dist/          # 编译后的文件
├── package.json   # 项目配置
└── README.md      # 项目文档
```
