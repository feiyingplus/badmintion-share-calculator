"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { useToast } from "@/hooks/use-toast"
import { ChevronDown, Copy, Calculator, Users, Target } from "lucide-react"

interface BadmintonSettings {
  bucketPrice: string
  bucketQuantity: string
  singlePrice: string
  venue2Hours: string
  venue3Hours: string
}

const defaultSettings: BadmintonSettings = {
  bucketPrice: "135",
  bucketQuantity: "12",
  singlePrice: "11.25",
  venue2Hours: "25",
  venue3Hours: "30",
}

export default function BadmintonCalculator() {
  const [settings, setSettings] = useState<BadmintonSettings>(defaultSettings)
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  const [people3Hours, setPeople3Hours] = useState<number>(0)
  const [people2Hours, setPeople2Hours] = useState<number>(0)
  const [balls6to7, setBalls6to7] = useState<number>(0)
  const [balls7to9, setBalls7to9] = useState<number>(0)
  const [useSinglePrice, setUseSinglePrice] = useState(false)
  const [hasCustomizedSinglePrice, setHasCustomizedSinglePrice] = useState(false)
  const [isCopying, setIsCopying] = useState(false)
  const { toast } = useToast()

  // 从localStorage加载设置
  useEffect(() => {
    const savedSettings = localStorage.getItem("badminton-settings")
    const savedUseSinglePrice = localStorage.getItem("badminton-use-single-price")
    const savedHasCustomized = localStorage.getItem("badminton-has-customized-single-price")

    if (savedSettings) {
      setSettings(JSON.parse(savedSettings))
    }

    if (savedUseSinglePrice) {
      setUseSinglePrice(JSON.parse(savedUseSinglePrice))
    }

    if (savedHasCustomized) {
      setHasCustomizedSinglePrice(JSON.parse(savedHasCustomized))
    }
  }, [])

  // 保存设置到localStorage
  useEffect(() => {
    localStorage.setItem("badminton-settings", JSON.stringify(settings))
    localStorage.setItem("badminton-use-single-price", JSON.stringify(useSinglePrice))
    localStorage.setItem("badminton-has-customized-single-price", JSON.stringify(hasCustomizedSinglePrice))
  }, [settings, useSinglePrice, hasCustomizedSinglePrice])

  // 计算单个羽毛球价格
  const calculateSinglePrice = () => {
    if (useSinglePrice) {
      const price = parseFloat(settings.singlePrice)
      return isNaN(price) ? 0 : price
    } else {
      const bucketPrice = parseFloat(settings.bucketPrice)
      const bucketQuantity = parseFloat(settings.bucketQuantity)
      if (isNaN(bucketPrice) || isNaN(bucketQuantity) || bucketQuantity === 0) {
        return 0
      }
      return bucketPrice / bucketQuantity
    }
  }

  // 更新设置
  const updateSettings = (key: keyof BadmintonSettings, value: string) => {
    setSettings((prev) => ({ ...prev, [key]: value }))
  }

  // 恢复默认设置
  const resetSettings = () => {
    setSettings(defaultSettings)
    setUseSinglePrice(false)
    setHasCustomizedSinglePrice(false)
    toast({
      title: "🔄 设置已重置",
      description: "所有费用设置已恢复为默认值",
    })
  }

  // 切换到单价模式时，用桶设定计算出的单价作为初始值
  const switchToSinglePrice = () => {
    // 只有在用户没有自定义过单价时，才用桶设定计算的单价作为初始值
    if (!hasCustomizedSinglePrice) {
      const bucketPrice = parseFloat(settings.bucketPrice)
      const bucketQuantity = parseFloat(settings.bucketQuantity)
      if (!isNaN(bucketPrice) && !isNaN(bucketQuantity) && bucketQuantity !== 0) {
        const calculatedSingle = bucketPrice / bucketQuantity
        setSettings((prev) => ({ ...prev, singlePrice: calculatedSingle.toString() }))
      }
    }
    setUseSinglePrice(true)
  }

  // 切换到桶模式时，不改变桶设定的原始值
  const switchToBucketPrice = () => {
    setUseSinglePrice(false)
  }

  // 智能计算逻辑
  const calculateCosts = () => {
    const singlePrice = calculateSinglePrice()

    const result = {
      cost3Hours: 0,
      cost2Hours: 0,
      ballCost3Hours: 0,
      ballCost2Hours: 0,
      ballCost6to7For3Hours: 0,
      ballCost7to9For3Hours: 0,
      venue3Hours: settings.venue3Hours,
      venue2Hours: settings.venue2Hours,
      summary: "",
      hasActivity: false,
      totalBallCost: 0,
    }

    // 检查是否有活动
    const has6to7 = balls6to7 > 0
    const has7to9 = balls7to9 > 0

    if (!has6to7 && !has7to9) {
      return result
    }

    result.hasActivity = true

    // 计算总用球费用
    result.totalBallCost = (balls6to7 + balls7to9) * singlePrice

    // 获取场地费数值
    const venue3HoursNum = parseFloat(settings.venue3Hours) || 0
    const venue2HoursNum = parseFloat(settings.venue2Hours) || 0
    result.venue3Hours = venue3HoursNum
    result.venue2Hours = venue2HoursNum

    // 计算3小时人员费用
    if (people3Hours > 0) {
      // 6-7点：只有3小时人员参与
      if (has6to7) {
        result.ballCost6to7For3Hours = (balls6to7 * singlePrice) / people3Hours
      }

      // 7-9点：3小时人员和2小时人员都参与
      if (has7to9) {
        const totalPeople7to9 = people3Hours + people2Hours
        if (totalPeople7to9 > 0) {
          result.ballCost7to9For3Hours = (balls7to9 * singlePrice) / totalPeople7to9
        }
      }

      result.ballCost3Hours = result.ballCost6to7For3Hours + result.ballCost7to9For3Hours
      result.cost3Hours = venue3HoursNum + result.ballCost3Hours
    }

    // 计算2小时人员费用（仅参与7-9点）
    if (people2Hours > 0 && has7to9) {
      const totalPeople7to9 = people3Hours + people2Hours
      result.ballCost2Hours = (balls7to9 * singlePrice) / totalPeople7to9
      result.cost2Hours = venue2HoursNum + result.ballCost2Hours
    }

    // 生成总结文字
    const summaryParts = []

    if (result.cost3Hours > 0) {
      summaryParts.push(`3小时场地费${result.venue3Hours}元 + ${result.ballCost3Hours.toFixed(2)}元球费`)
    }

    if (result.cost2Hours > 0) {
      summaryParts.push(`2小时场地费${result.venue2Hours}元 + ${result.ballCost2Hours.toFixed(2)}元球费`)
    }

    if (summaryParts.length > 0) {
      result.summary = `今日球费: ${summaryParts.join(", ")}`
    }

    return result
  }

  const costs = calculateCosts()

  // 复制功能
  const copyToClipboard = async () => {
    if (!costs.summary) {
      toast({
        title: "复制失败",
        description: "没有可复制的费用信息",
        variant: "destructive",
      })
      return
    }

    setIsCopying(true)

    try {
      await navigator.clipboard.writeText(costs.summary)
      toast({
        title: "✅ 复制成功！",
        description: "费用总结已复制到剪贴板，可以直接粘贴分享",
      })
    } catch (err) {
      // 降级方案
      try {
        const textArea = document.createElement("textarea")
        textArea.value = costs.summary
        textArea.style.position = "fixed"
        textArea.style.left = "-999999px"
        textArea.style.top = "-999999px"
        document.body.appendChild(textArea)
        textArea.focus()
        textArea.select()
        const successful = document.execCommand("copy")
        document.body.removeChild(textArea)

        if (successful) {
          toast({
            title: "✅ 复制成功！",
            description: "费用总结已复制到剪贴板，可以直接粘贴分享",
          })
        } else {
          throw new Error("复制命令执行失败")
        }
      } catch (fallbackErr) {
        toast({
          title: "复制失败",
          description: "请手动选择并复制上方的费用总结文字",
          variant: "destructive",
        })
      }
    } finally {
      // 延迟重置状态，让用户看到视觉反馈
      setTimeout(() => {
        setIsCopying(false)
      }, 1000)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-100 p-4 relative overflow-hidden" suppressHydrationWarning>
      {/* 背景装饰 */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-emerald-200/30 to-teal-200/30 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-cyan-200/30 to-blue-200/30 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-emerald-100/20 to-teal-100/20 rounded-full blur-3xl"></div>
      </div>
      
      <div className="max-w-md mx-auto space-y-6 relative z-10">
        {/* 标题 */}
        <div className="text-center animate-fade-in">
          <div className="mb-4 relative">
            <div className="absolute inset-0 bg-gradient-to-r from-emerald-400 to-teal-400 rounded-2xl blur-lg opacity-20 animate-pulse"></div>
            <div className="relative bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-white/50">
              <h1 className="text-3xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent mb-2 flex items-center justify-center gap-3" data-cy="calculator-title">
                <div className="relative">
                  <Calculator className="w-8 h-8 text-emerald-600 animate-bounce" style={{ animationDuration: '2s' }} />
                  <div className="absolute inset-0 w-8 h-8 bg-emerald-400 rounded-full blur-md opacity-30 animate-ping"></div>
                </div>
                羽毛球费用计算器
              </h1>
              <p className="text-gray-600 text-lg font-medium" data-cy="calculator-subtitle">
                <span className="inline-block animate-bounce" style={{ animationDelay: '0.1s' }}>🏸</span>
                <span className="mx-2">羽动人生</span>
                <span className="inline-block animate-bounce" style={{ animationDelay: '0.2s' }}>🏸</span>
              </p>
            </div>
          </div>
        </div>

        {/* 费用设定区域 */}
        <Card className="shadow-2xl bg-white/90 backdrop-blur-sm border-0 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-purple-500/5 opacity-0"></div>
          <Collapsible open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
            <CollapsibleTrigger asChild>
              <CardHeader className="cursor-pointer hover:bg-gray-50 transition-colors relative" data-cy="settings-collapsible">
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <Calculator className="w-5 h-5 text-blue-600" />
                    </div>
                    <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent font-semibold">费用设定</span>
                  </div>
                  <ChevronDown className={`w-5 h-5 transition-transform ${isSettingsOpen ? "rotate-180" : ""}`} />
                </CardTitle>
                <CardDescription className="flex items-center gap-2" data-cy="current-price-display">
                  <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
                  <span className="font-medium">当前单价: </span>
                  <span className="font-bold text-emerald-600 text-lg">¥{calculateSinglePrice().toFixed(2)}</span>
                  <span className="text-gray-500">/个</span>
                </CardDescription>
              </CardHeader>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <CardContent className="space-y-6 relative">
                {/* 羽毛球价格设定 */}
                <div className="space-y-4">
                  <div className="flex items-center gap-4 mb-4">
                    <h4 className="font-semibold text-gray-700 flex items-center gap-2">
                      <div className="w-3 h-3 bg-gradient-to-r from-orange-400 to-red-400 rounded-full"></div>
                      羽毛球价格设定
                    </h4>
                    <div className="flex bg-gradient-to-r from-gray-100 to-gray-50 rounded-xl p-1 shadow-inner border border-gray-200/50">
                      <button
                        type="button"
                        onClick={switchToBucketPrice}
                        className={`px-4 py-2 text-sm rounded-lg transition-all duration-300 font-medium ${!useSinglePrice 
                          ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg transform scale-105" 
                          : "text-gray-600 hover:text-gray-800 hover:bg-white/50"
                        }`}
                        data-cy="bucket-mode-button"
                      >
                        按桶设定
                      </button>
                      <button
                        type="button"
                        onClick={switchToSinglePrice}
                        className={`px-4 py-2 text-sm rounded-lg transition-all duration-300 font-medium ${useSinglePrice 
                          ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg transform scale-105" 
                          : "text-gray-600 hover:text-gray-800 hover:bg-white/50"
                        }`}
                        data-cy="single-mode-button"
                      >
                        单价设定
                      </button>
                    </div>
                  </div>
                  {!useSinglePrice ? (
                    // 按桶设定模式
                    <>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <Label htmlFor="bucketPrice">每桶价格(元)</Label>
                          <Input
                            id="bucketPrice"
                            type="number"
                            step="0.01"
                            value={settings.bucketPrice}
                            onChange={(e) => updateSettings("bucketPrice", e.target.value)}
                            placeholder="0"
                            data-cy="bucket-price-input"
                          />
                        </div>
                        <div>
                          <Label htmlFor="bucketQuantity">每桶数量(个)</Label>
                          <Input
                            id="bucketQuantity"
                            type="number"
                            value={settings.bucketQuantity}
                            onChange={(e) => updateSettings("bucketQuantity", e.target.value)}
                            placeholder="0"
                            data-cy="bucket-quantity-input"
                          />
                        </div>
                      </div>
                      <div className="bg-gradient-to-r from-blue-50 to-cyan-50 p-3 rounded-xl border border-blue-200/50 shadow-sm" data-cy="calculated-price-display">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
                          <span className="text-sm font-medium text-blue-700">计算单价:</span>
                          <span className="font-bold text-blue-800 text-lg">¥{calculateSinglePrice().toFixed(2)}</span>
                          <span className="text-blue-600">/个</span>
                        </div>
                      </div>
                    </>
                  ) : (
                    // 单价设定模式
                    <div>
                      <Label htmlFor="singlePrice" className="flex items-center gap-2">
                        单个羽毛球价格(元)
                        <span className="text-xs bg-orange-100 text-orange-600 px-2 py-0.5 rounded">自定义</span>
                      </Label>
                      <Input
                        id="singlePrice"
                        type="number"
                        step="0.01"
                        value={settings.singlePrice}
                        onChange={(e) => {
                          updateSettings("singlePrice", e.target.value)
                          if (e.target.value !== "") {
                            setHasCustomizedSinglePrice(true)
                          }
                        }}
                        onFocus={(e) => {
                          e.target.select()
                        }}
                        className="text-lg font-medium"
                        placeholder="0.00"
                        data-cy="single-price-input"
                      />
                      <div className="text-xs text-gray-500 mt-1">
                        参考价格: ¥{(() => {
                          const bucketPrice = parseFloat(settings.bucketPrice)
                          const bucketQuantity = parseFloat(settings.bucketQuantity)
                          if (isNaN(bucketPrice) || isNaN(bucketQuantity) || bucketQuantity === 0) {
                            return "0.00"
                          }
                          return (bucketPrice / bucketQuantity).toFixed(2)
                        })()}/个 (基于桶设定计算)
                      </div>
                    </div>
                  )}
                </div>

                {/* 场地费设定 */}
                <div className="space-y-4">
                  <h4 className="font-semibold text-gray-700 flex items-center gap-2">
                    <div className="w-3 h-3 bg-gradient-to-r from-green-400 to-emerald-400 rounded-full"></div>
                    场地费设定
                  </h4>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label htmlFor="venue2Hours">2小时场地费(元)</Label>
                      <Input
                        id="venue2Hours"
                        type="number"
                        step="0.01"
                        value={settings.venue2Hours}
                        onChange={(e) => updateSettings("venue2Hours", e.target.value)}
                        placeholder="0"
                        data-cy="venue-2hours-input"
                      />
                    </div>
                    <div>
                      <Label htmlFor="venue3Hours">3小时场地费(元)</Label>
                      <Input
                        id="venue3Hours"
                        type="number"
                        step="0.01"
                        value={settings.venue3Hours}
                        onChange={(e) => updateSettings("venue3Hours", e.target.value)}
                        placeholder="0"
                        data-cy="venue-3hours-input"
                      />
                    </div>
                  </div>
                </div>

                <Button 
                  onClick={resetSettings} 
                  variant="outline" 
                  className="w-full bg-gradient-to-r from-gray-50 to-gray-100 hover:from-gray-100 hover:to-gray-200 border-2 border-gray-200 hover:border-gray-300 transition-all duration-300 group" 
                  data-cy="reset-settings-button"
                >
                  <Calculator className="w-4 h-4 mr-2 group-hover:rotate-12 transition-transform duration-300" />
                  恢复默认设定
                </Button>
              </CardContent>
            </CollapsibleContent>
          </Collapsible>
        </Card>

        {/* 合并的参与信息输入区域 */}
        <Card className="shadow-2xl bg-white/90 backdrop-blur-sm border-0 overflow-hidden">
          <CardHeader>
            <CardTitle className="text-green-700 flex items-center gap-3">
              <div className="relative">
                <Users className="w-5 h-5" />
              </div>
              <span className="bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent font-semibold">参与信息</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6 relative">
            {/* 参与人数 */}
            <div className="space-y-4">
              <h4 className="font-semibold text-gray-700 flex items-center gap-2">
                <div className="w-3 h-3 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full"></div>
                <Users className="w-4 h-4" />
                参与人数
              </h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="people3Hours">3小时人数</Label>
                  <Input
                    id="people3Hours"
                    type="number"
                    min="0"
                    value={people3Hours || ""}
                    onChange={(e) => setPeople3Hours(Number(e.target.value) || 0)}
                    placeholder="0"
                    data-cy="people-3hours-input"
                  />
                </div>
                <div>
                  <Label htmlFor="people2Hours">2小时人数</Label>
                  <Input
                    id="people2Hours"
                    type="number"
                    min="0"
                    value={people2Hours || ""}
                    onChange={(e) => setPeople2Hours(Number(e.target.value) || 0)}
                    placeholder="0"
                    data-cy="people-2hours-input"
                  />
                </div>
              </div>
            </div>

            {/* 分隔线 */}
            <div className="relative">
              <div className="border-t border-gray-200"></div>
              <div className="absolute inset-0 flex justify-center">
                <div className="bg-white px-4">
                  <div className="w-8 h-0.5 bg-gradient-to-r from-transparent via-gray-300 to-transparent"></div>
                </div>
              </div>
            </div>

            {/* 羽毛球使用量 */}
            <div className="space-y-4">
              <h4 className="font-semibold text-gray-700 flex items-center gap-2">
                <div className="w-3 h-3 bg-gradient-to-r from-orange-400 to-red-400 rounded-full"></div>
                <Target className="w-4 h-4" />
                羽毛球使用量
              </h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="balls6to7">6-7点球数</Label>
                  <Input
                    id="balls6to7"
                    type="number"
                    min="0"
                    value={balls6to7 || ""}
                    onChange={(e) => setBalls6to7(Number(e.target.value) || 0)}
                    placeholder="0"
                    data-cy="balls-6to7-input"
                  />
                </div>
                <div>
                  <Label htmlFor="balls7to9">7-9点球数</Label>
                  <Input
                    id="balls7to9"
                    type="number"
                    min="0"
                    value={balls7to9 || ""}
                    onChange={(e) => setBalls7to9(Number(e.target.value) || 0)}
                    placeholder="0"
                    data-cy="balls-7to9-input"
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 费用计算结果 */}
        <Card className="shadow-2xl bg-white/95 backdrop-blur-sm border-0 overflow-hidden relative" data-cy="cost-results-section">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-green-400 via-emerald-400 to-teal-400"></div>
          <CardHeader className="relative">
            <CardTitle className="text-green-700 flex items-center gap-3">
              <div className="relative">
                <div className="w-6 h-6 bg-gradient-to-r from-green-400 to-emerald-400 rounded-full flex items-center justify-center">
                  <Calculator className="w-3 h-3 text-white" />
                </div>
                <div className="absolute inset-0 w-6 h-6 bg-green-400 rounded-full blur-md opacity-30 animate-pulse"></div>
              </div>
              <span className="bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent font-bold text-xl">费用计算结果</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6 relative">
            {costs.hasActivity ? (
              <>
                {/* 详细费用分解 */}
                <div className="space-y-4">
                  {/* 3小时活动费用 */}
                  {costs.cost3Hours > 0 && (
                    <div className="bg-gradient-to-br from-blue-50 to-cyan-50 p-4 rounded-xl border border-blue-200/50 shadow-sm" data-cy="cost-breakdown-3hours">
                      <h4 className="font-semibold text-blue-700 mb-3 flex items-center gap-2">
                        <div className="w-3 h-3 bg-gradient-to-r from-blue-400 to-cyan-400 rounded-full"></div>
                        3小时活动费用
                      </h4>
                      <div className="space-y-1 text-sm">
                        <div className="flex justify-between">
                          <span>参与人数:</span>
                          <span className="font-semibold">{people3Hours}人</span>
                        </div>
                        <div className="flex justify-between" data-cy="venue-cost-display">
                          <span>场地费:</span>
                          <span className="font-semibold">¥{costs.venue3Hours}</span>
                        </div>
                        {costs.ballCost6to7For3Hours > 0 && (
                          <div className="flex justify-between">
                            <span>6-7点人均球费:</span>
                            <span className="font-semibold">¥{costs.ballCost6to7For3Hours.toFixed(2)}</span>
                          </div>
                        )}
                        {costs.ballCost7to9For3Hours > 0 && (
                          <div className="flex justify-between">
                            <span>7-9点人均球费:</span>
                            <span className="font-semibold">¥{costs.ballCost7to9For3Hours.toFixed(2)}</span>
                          </div>
                        )}
                        <div className="flex justify-between" data-cy="ball-cost-display">
                          <span>总人均球费:</span>
                          <span className="font-semibold">¥{costs.ballCost3Hours.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between border-t pt-1 font-bold text-blue-700" data-cy="cost-3hours-display">
                          <span>人均总费用:</span>
                          <span>¥{costs.cost3Hours.toFixed(2)}</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* 2小时活动费用 */}
                  {costs.cost2Hours > 0 && (
                    <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-4 rounded-xl border border-green-200/50 shadow-sm" data-cy="cost-breakdown-2hours">
                      <h4 className="font-semibold text-green-700 mb-3 flex items-center gap-2">
                        <div className="w-3 h-3 bg-gradient-to-r from-green-400 to-emerald-400 rounded-full"></div>
                        2小时活动费用
                      </h4>
                      <div className="space-y-1 text-sm">
                        <div className="flex justify-between">
                          <span>参与人数:</span>
                          <span className="font-semibold">{people2Hours}人</span>
                        </div>
                        <div className="flex justify-between">
                          <span>场地费:</span>
                          <span className="font-semibold">¥{costs.venue2Hours}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>人均球费:</span>
                          <span className="font-semibold">¥{costs.ballCost2Hours.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between border-t pt-1 font-bold text-green-700" data-cy="cost-2hours-display">
                          <span>人均总费用:</span>
                          <span>¥{costs.cost2Hours.toFixed(2)}</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* 羽毛球使用详情 */}
                  <div className="bg-gradient-to-br from-gray-50 to-slate-50 p-4 rounded-xl border border-gray-200/50 shadow-sm" data-cy="ball-usage-details">
                    <h4 className="font-semibold text-gray-700 mb-3 flex items-center gap-2">
                      <div className="w-3 h-3 bg-gradient-to-r from-gray-400 to-slate-400 rounded-full"></div>
                      羽毛球使用详情
                    </h4>
                    <div className="space-y-1 text-sm">
                      {balls6to7 > 0 && (
                        <div className="flex justify-between">
                          <span>6-7点用球:</span>
                          <span className="font-semibold">
                            {balls6to7}个 (¥{(balls6to7 * calculateSinglePrice()).toFixed(2)})
                          </span>
                        </div>
                      )}
                      {balls7to9 > 0 && (
                        <div className="flex justify-between">
                          <span>7-9点用球:</span>
                          <span className="font-semibold">
                            {balls7to9}个 (¥{(balls7to9 * calculateSinglePrice()).toFixed(2)})
                          </span>
                        </div>
                      )}
                      <div className="flex justify-between border-t pt-1 font-bold" data-cy="total-cost-display">
                        <span>总用球费用:</span>
                        <span>¥{costs.totalBallCost.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 总结文字 */}
                <div className="bg-gradient-to-br from-orange-50 to-amber-50 p-4 rounded-xl border-2 border-orange-200/50 shadow-lg relative overflow-hidden">
                  <div className="relative">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-3 h-3 bg-gradient-to-r from-orange-400 to-amber-400 rounded-full animate-pulse"></div>
                      <span className="font-semibold text-orange-700">费用总结</span>
                    </div>
                    <p className="text-sm text-gray-700 mb-4 font-medium bg-white/50 p-3 rounded-lg border border-orange-200/30" data-cy="summary-text">{costs.summary}</p>
                    <Button 
                      onClick={copyToClipboard} 
                      disabled={isCopying}
                      className={`w-full shadow-lg hover:shadow-xl transition-all duration-300 group border-0 ${
                        isCopying 
                          ? "bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-500 hover:to-emerald-500" 
                          : "bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600"
                      }`}
                      data-cy="copy-button"
                    >
                      {isCopying ? (
                        <>
                          <div className="w-4 h-4 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          复制中...
                        </>
                      ) : (
                        <>
                          <Copy className="w-4 h-4 mr-2 group-hover:rotate-12 transition-transform duration-300" />
                          复制费用总结
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </>
            ) : (
              <div className="text-center py-8" data-cy="no-activity-message">
                <div className="relative mb-4">
                  <div className="w-16 h-16 bg-gradient-to-r from-gray-200 to-gray-300 rounded-full mx-auto flex items-center justify-center">
                    <Calculator className="w-8 h-8 text-gray-400" />
                  </div>
                  <div className="absolute inset-0 w-16 h-16 bg-gray-300 rounded-full mx-auto blur-lg opacity-20 animate-pulse"></div>
                </div>
                <p className="text-gray-500 font-medium">请输入人数和羽毛球数量开始计算</p>
                <p className="text-gray-400 text-sm mt-2">填写上方信息后，这里将显示详细的费用分解</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
