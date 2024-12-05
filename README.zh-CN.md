# 强度分段管理器

[![CI](https://github.com/h1bomb/intensity-segments/actions/workflows/ci.yml/badge.svg)](https://github.com/h1bomb/intensity-segments/actions/workflows/ci.yml)
<a href="https://codecov.io/github/h1bomb/intensity-segments" > 
 <img src="https://codecov.io/github/h1bomb/intensity-segments/graph/badge.svg?token=1DP6kKsrGG"/> 
 </a>
<a href="https://badge.fury.io/js/intensity-segments"><img src="https://badge.fury.io/js/intensity-segments.svg" alt="npm version" height="18"></a>
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

[English](./README.md) | 简体中文

一个用于管理时间轴上强度分段的 JavaScript 库。该库提供了一种强大的方式来处理重叠的强度变化，并维护一个简洁高效的时间强度值表示。

## 特性

- 高效的时间强度值管理
- 自动分段合并和优化
- 零强度分段优化
- 高效的强度查询缓存机制
- 支持浏览器和 Node.js 环境

## 安装

```bash
npm install intensity-segments
```

## 使用方法

```javascript
import { IntensitySegments } from 'intensity-segments';

// 创建新实例，配置缓存参数
const segments = new IntensitySegments({
  maxSize: 1000,  // 最大缓存数量
  ttl: 5000       // 缓存生存时间（毫秒）
});

// 为范围添加强度
segments.add(10, 20, 2);  // 在时间 10 到 20 之间添加强度值 2

// 为范围设置强度
segments.set(15, 25, 3);  // 在时间 15 到 25 之间设置强度值为 3

// 查询特定时间点的强度值
const intensity = segments.getIntensityAt(18);  // 获取时间点 18 的强度值

// 获取特定时间点所在的分段信息
const segment = segments.getSegmentAt(18);  // 获取包含时间点 18 的分段
// 返回：{ start: 15, end: 25, intensity: 3 }

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
```javascript
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
```javascript
// 初始状态：[[0, 1], [10, 2], [20, 1]]
segments.set(5, 15, 3);
// 结果：[[0, 1], [5, 3], [15, 1], [20, 0]]
```

#### getIntensityAt(time: number)

获取特定时间点的强度值：
1. 检查缓存中是否存在该值
2. 如果不在缓存中，执行二分查找
3. 更新缓存
4. 返回强度值

示例：
```javascript
// 状态：[[0, 1], [10, 2], [20, 0]]
const intensity = segments.getIntensityAt(15);  // 返回 2
```

#### getSegmentAt(time: number)

获取包含特定时间点的分段详细信息：
1. 如果时间点在第一个分段之前或最后一个非零分段之后，返回 null
2. 返回包含起始时间、结束时间和强度值的分段信息

示例：
```javascript
// 状态：[[0, 1], [10, 2], [20, 0]]
const segment = segments.getSegmentAt(15);
// 返回：{ start: 10, end: 20, intensity: 2 }
```

### 性能优化

1. **缓存机制**
   - LRU（最近最少使用）缓存策略
   - 可配置的缓存大小和生存时间
   - 自动清理过期缓存条目

2. **零值处理**
   - 移除不必要的零强度分段
   - 跳过开头的零强度分段
   - 保留非零分段之间的零强度分段
   - 优化尾部零强度分段

3. **分段合并**
   - 自动合并具有相同强度的相邻分段
   - 移除冗余点
   - 维护最小分段表示

4. **边界情况**
   - 正确处理重叠分段
   - 支持负强度值
   - 维护适当的分段边界

## 示例场景

### 1. 添加重叠强度

```javascript
const segments = new IntensitySegments();
segments.add(0, 10, 1);   // [[0, 1], [10, 0]]
segments.add(5, 15, 2);   // [[0, 1], [5, 3], [10, 2], [15, 0]]
```

### 2. 设置强度

```javascript
const segments = new IntensitySegments();
segments.add(0, 20, 1);   // [[0, 1], [20, 0]]
segments.set(10, 30, 2);  // [[0, 1], [10, 2], [30, 0]]
```

### 3. 强度抵消

```javascript
const segments = new IntensitySegments();
segments.add(0, 10, 2);    // [[0, 2], [10, 0]]
segments.add(0, 10, -2);   // 空结果（所有零值被移除）
```

### 4. 使用缓存提升性能

```javascript
const segments = new IntensitySegments({
  maxSize: 1000,  // 缓存最多 1000 个点
  ttl: 5000       // 缓存条目 5 秒后过期
});

// 第一次查询执行计算
const intensity1 = segments.getIntensityAt(15);

// 第二次查询使用缓存值
const intensity2 = segments.getIntensityAt(15);  // 更快的响应
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
```

## 开源协议

本项目基于 MIT 许可证开源 - 查看 [LICENSE](LICENSE) 文件了解详情。
