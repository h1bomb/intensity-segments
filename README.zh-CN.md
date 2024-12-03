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

```bash
npm install intensity-segments
```

## 使用方法

```typescript
import { IntensitySegments } from 'intensity-segments';

// 创建新实例
const segments = new IntensitySegments();

// 为范围添加强度
segments.add(10, 20, 2);  // 在时间 10 到 20 之间添加强度值 2

// 为范围设置强度
segments.set(15, 25, 3);  // 在时间 15 到 25 之间设置强度值为 3

// 获取字符串表示
console.log(segments.toString());  // 显示当前分段
```

## 实现细节

### 数据结构

`IntensitySegments` 类使用 `[point, intensity]` 对数组来表示随时间变化的强度。每一对表示：
- `point`：分段的起始点
- `intensity`：该分段的强度值

例如，`[[0, 1], [10, 2], [20, 0]]` 表示：
- 从点 0 到 10 的强度为 1
- 从点 10 到 20 的强度为 2
- 点 20 之后的强度为 0

### 主要方法

#### add(from: number, to: number, amount: number)

为指定范围添加强度变化：
1. 将现有分段转换为点变化
2. 添加新的强度变化
3. 重新计算所有分段

示例：
```typescript
// 初始状态：[[0, 1], [10, 0]]
segments.add(5, 15, 2);
// 结果：[[0, 1], [5, 3], [10, 2], [15, 0]]
```

#### set(from: number, to: number, amount: number)

为范围设置绝对强度：
1. 保留范围之前的分段
2. 为该范围设置新强度
3. 保留范围之后的分段
4. 规范化结果分段

示例：
```typescript
// 初始状态：[[0, 1], [10, 2], [20, 1]]
segments.set(5, 15, 3);
// 结果：[[0, 1], [5, 3], [15, 1], [20, 0]]
```

### 优化特性

1. **零值处理**
   - 移除不必要的零强度分段
   - 在表示有意义的过渡时保留零分段

2. **分段合并**
   - 自动合并具有相同强度的相邻分段
   - 移除冗余点

3. **边界情况**
   - 正确处理重叠分段
   - 支持负强度值
   - 维护适当的分段边界

## 示例场景

### 1. 添加重叠强度

```typescript
const segments = new IntensitySegments();
segments.add(0, 10, 1);   // [[0, 1], [10, 0]]
segments.add(5, 15, 2);   // [[0, 1], [5, 3], [10, 2], [15, 0]]
```

### 2. 设置强度

```typescript
const segments = new IntensitySegments();
segments.add(0, 20, 1);   // [[0, 1], [20, 0]]
segments.set(10, 30, 2);  // [[0, 1], [10, 2], [30, 0]]
```

### 3. 强度抵消

```typescript
const segments = new IntensitySegments();
segments.add(0, 10, 2);    // [[0, 2], [10, 0]]
segments.add(0, 10, -2);   // 空结果（所有零值被移除）
```

## 开发

```bash
# 安装依赖
npm install

# 运行开发环境
npm run dev

# 运行测试
npm test

# 运行测试并生成覆盖率报告
npm run test:coverage

# 构建
npm run build
```

## 项目结构

```
.
├── src/           # 源代码文件
├── tests/         # 测试文件
├── dist/          # 编译后的文件
├── package.json   # 项目配置
└── README.md      # 项目文档
