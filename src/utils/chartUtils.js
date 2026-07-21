/**
 * 生成随机数据数组
 * @param {number} length - 数组长度
 * @param {number} min - 最小值
 * @param {number} max - 最大值
 * @returns {Array} - 随机数据数组
 */
export const generateRandomData = (length, min, max) => {
  return Array.from({ length }, () => Math.floor(Math.random() * (max - min + 1)) + min)
}

/**
 * 生成日期范围数组
 * @param {number} days - 天数
 * @returns {Array} - 日期字符串数组，格式为 "月/日"
 */
export const generateDateRange = (days) => {
  const result = []
  const endDate = new Date()

  for (let i = days - 1; i >= 0; i--) {
    const date = new Date()
    date.setDate(endDate.getDate() - i)
    result.push(`${date.getMonth() + 1}/${date.getDate()}`)
  }

  return result
}

/**
 * 格式化数字，大于10000转为万，大于10000000转为千万
 * @param {number} num - 要格式化的数字
 * @returns {string} - 格式化后的字符串
 */
export const formatNumber = (num) => {
  if (num >= 10000000) {
    return (num / 10000000).toFixed(1) + '千万'
  } else if (num >= 10000) {
    return (num / 10000).toFixed(1) + '万'
  }
  return num.toString()
}

/**
 * 模拟API调用，生成分析数据
 * @param {string} keyword - 关键词
 * @param {string} analysisType - 分析类型
 * @returns {Promise<Object>} - 分析结果数据
 */
export const fetchAnalysisData = async (keyword, _analysisType) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const result = {
        success: true,
        data: {
          topCities: [
            { rank: 1, city: '北京', score: 98, percentage: 16.3 },
            { rank: 2, city: '上海', score: 94, percentage: 15.7 },
            { rank: 3, city: '广州', score: 89, percentage: 14.8 },
            { rank: 4, city: '深圳', score: 85, percentage: 14.2 },
            { rank: 5, city: '杭州', score: 80, percentage: 13.3 },
            { rank: 6, city: '成都', score: 75, percentage: 12.5 },
            { rank: 7, city: '南京', score: 70, percentage: 11.7 },
            { rank: 8, city: '武汉', score: 65, percentage: 10.8 },
            { rank: 9, city: '西安', score: 60, percentage: 10.0 },
            { rank: 10, city: '重庆', score: 55, percentage: 9.2 }
          ],
          findings: [
            `"${keyword}"近30天热度上升了24.5%，搜索量持续增长`,
            `用户主要集中在一线城市，25-34岁女性是主要关注人群`,
            `相关话题中"极简风格"和"原木家具"与该关键词高度相关`,
            `与该关键词相关的视频内容平均播放量比行业平均高32%`,
            `用户对该类产品的价格敏感度较低，更注重设计和品质`
          ],
          marketingTips: [
            {
              title: '内容营销策略',
              content: '建议围绕"极简生活"、"环保家居"等主题创作短视频，与当前热点话题结合，增加曝光度'
            },
            {
              title: '产品推广重点',
              content: '突出产品的设计感和实用性，针对小户型用户群体，强调空间利用和多功能特性'
            },
            {
              title: '营销渠道选择',
              content: '优先投放抖音、小红书等平台，针对25-34岁女性用户群体定向推广'
            }
          ],
          trendAnalysis: `根据数据分析，"${keyword}"相关的家居产品市场正处于快速增长期，与去年同期相比增长了35%。消费者对高品质、设计感强的产品需求明显，价格因素影响较小。建议在产品设计和营销中强调环保材质、收纳功能和极简风格等要素，以满足目标人群需求。`
        }
      }

      resolve(result)
    }, 1500)
  })
}
