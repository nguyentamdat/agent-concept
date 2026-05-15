# Đánh Giá Bộ Kit Thiết Kế Game - Hướng Dẫn Toàn Diện

> **Mục tiêu:** Xác định bộ kit có thực sự "tốt" hay không thông qua 6 phương diện đo lường khách quan.

---

## 📋 Tổng quan 6 Phương Diện Đánh Giá

| # | Phương Diện | Ý Nghĩa | Threshold Tốt |
|---|-------------|---------|---------------|
| 1 | **Task Completion Rate** | Tỷ lệ hoàn thành pipeline không cần can thiệp | ≥80% |
| 2 | **Step Efficiency** | Hiệu quả số bước tool calls | <50 calls / <4h |
| 3 | **Cost per Output** | Chi phí/token hiệu quả | <$15/pipeline |
| 4 | **Consistency** | Độ nhất quán qua nhiều lần chạy | <10% variance |
| 5 | **Cross-Validation** | Tính đồng nhất giữa artifacts | <5% contradiction |
| 6 | **End-User Satisfaction** | Hữu dụng cho người dùng cuối | ≥70% usable |

---

## 1️⃣ Task Completion Rate

### Định nghĩa
Tỷ lệ % pipeline hoàn thành đến Gate 4 (Detail Docs approved) mà **không cần human intervention**.

### Cách đo
```bash
# Chạy 10-20 game concept khác nhau qua toàn bộ pipeline
# Ghi transcript/metrics từ Claude Code cho từng lần chạy vào run-${i}.json
# Nếu cần cost/token chính xác, export usage từ Claude Code runtime; `claude --print`
# chỉ là runner/transcript harness, không tự thay thế metric tracker.
for i in {1..10}; do
  claude --print "/design-kit:create create-game-${i}" > "run-${i}.json"
done

# Đếm % hoàn thành đến Gate 4
completed=$(grep -l '"gate4": "approved"' run-*.json | wc -l)
total=10
rate=$((completed * 100 / total))
echo "Completion Rate: ${rate}%"
```

### Threshold
| Mức độ | Pass Rate | Hành động |
|--------|-----------|-----------|
| 🟢 Tốt | ≥80% | Duy trì, tối ưu thêm |
| 🟡 Ổn | 60-79% | Xem lại agent prompts, thêm constraints |
| 🔴 Cần cải thiện | <60% | Audit từng agent, refactor lớn |

### Root Cause Analysis khi fail
| Vấn đề | Nguyên nhân | Fix |
|--------|-------------|-----|
| Agent hiểu sai prompt | Prompt ambiguous | Thêm examples, clarify instructions |
| Thiếu tool/khả năng | Tool coverage incomplete | Thêm tool hoặc MCP |
| Output không đạt quality gate | Criteria quá strict | Tuning reviewer rubric |
| Model hallucination | Context too long | Dynamic context pruning |

---

## 2️⃣ Step Efficiency

### Định nghĩa
Số lượng tool calls và agent switches để hoàn thành 1 game concept.

### Cách đo
```json
// Log trong mỗi run
{
  "metrics": {
    "tool_calls_total": 42,
    "agent_switches": 8,
    "review_rounds_gate1": 1,
    "review_rounds_gate2": 2,
    "review_rounds_gate3": 1,
    "time_to_complete_minutes": 195
  }
}
```

### Target Metrics
| Metric | Target | Nếu vượt | 
|--------|--------|----------|
| Tool calls / pipeline | <50 | Tối ưu prompt/agent |
| Agent switches | <10 | Kiểm tra delegation logic |
| Review rounds / gate | ≤2 | Nếu >2 → prompt chưa chuẩn |
| Time to complete | <4h | Nếu >8h → xem lại scope |

### Benchmark so sánh
| Phương pháp | Thời gian GCD | Thời gian Full Pipeline |
|-------------|---------------|------------------------|
| Human designer manual | 1-2 ngày | 1-2 tuần |
| **Kit (target)** | **2-4h** | **<8h** |
| Kit (current) | Đo và ghi | Đo và ghi |

---

## 3️⃣ Cost per Output

### Định nghĩa
Token usage và model cost cho mỗi artifact trong pipeline.

### Cách đo
```bash
# Theo dõi qua Claude Code transcript / usage export của phiên chạy
# Hoặc tính từ model usage mà runtime cung cấp
```

### Target Cost
| Artifact | Model | Target Cost | Nếu vượt |
|----------|-------|-------------|----------|
| Phase 1 mini concepts | sonnet / kimi | $0.50-1.00 | Giảm scope mini prototype |
| Lightweight GCD | opus / kimi | $2-5 | Tối ưu review loop + template |
| Prototype | sonnet | $1-2 | Dùng quick category |
| Mockup | sonnet | $2-4 | Thêm constraints strict |
| Wireframe | sonnet | $1-2 | Nên dùng quick category |
| Detail Docs | sonnet | $3-6 | Viết 1-by-1, không batch |
| **TỔNG** | - | **<$15** | - |

### So sánh ROI
- **Human designer:** $50-100/hour × 40-80h = $2,000-8,000/game
- **Kit target:** <$15/game
- **Savings:** >99.9%

---

## 4️⃣ Consistency Score

### Định nghĩa
Độ nhất quán output qua nhiều lần chạy cùng 1 input.

### Cách đo
```bash
# Chạy cùng 1 concept 5 lần
for i in {1..5}; do
  claude --print "/design-kit:create same-concept run-${i}" > "consistency-${i}.json"
done

# So sánh:
# - Có đủ 6 artifacts không?
# - Có pass các gate không?
# - Score variance bao nhiêu?
```

### Metrics
| Metric | Target | Công thức |
|--------|--------|-----------|
| Success rate variance | <10% | σ(success_1..5) < 0.1 |
| Output structure | 100% | 5/5 đều đủ artifacts |
| Quality score variance | <0.5★ | σ(score_1..5) < 0.5 |
| Regression rate | 0% | Không lần nào tệ hơn lần trước |

### Xử lý non-determinism
Nếu variance cao (>10%):
1. Kiểm tra temperature setting (nên 0 hoặc rất thấp)
2. Thêm "thinking steps" vào agent prompts
3. Dùng structured output (JSON mode) nếu có thể
4. Fallback model consistency

---

## 5️⃣ Cross-Validation

### Định nghĩa
Tính nhất quán giữa các artifacts (không mâu thuẫn cross-reference).

### Automated Checks
| Check | Method | Tool |
|-------|--------|------|
| GCD ↔ Prototype | Mechanics trong prototype có trong GCD? | Parser + LLM judge |
| Prototype ↔ Mockup | Screens đầy đủ? | DOM selector count |
| Mockup ↔ Wireframe | 1:1 component sync? | data-component diff |
| Wireframe ↔ Detail Docs | Component spec match? | JSON schema compare |
| All ↔ Concept Pillars | Không contradiction? | LLM consistency check |

### Script mẫu
```python
# cross_validate.py
import json
import difflib

def validate_mockup_wireframe(mockup_path, wireframe_path):
    """Kiểm tra 1:1 sync giữa mockup và wireframe"""
    # Parse mockup.html lấy data-screen và data-component
    mockup_screens = parse_mockup_screens(mockup_path)
    mockup_components = parse_mockup_components(mockup_path)
    
    # Parse wireframe.html lấy WIREFRAME_DATA
    wireframe_data = parse_wireframe_data(wireframe_path)
    wireframe_screens = [s['id'] for s in wireframe_data['screens']]
    wireframe_components = extract_components(wireframe_data)
    
    # So sánh
    missing_in_wireframe = set(mockup_screens) - set(wireframe_screens)
    ghost_in_wireframe = set(wireframe_screens) - set(mockup_screens)
    
    return {
        'missing_screens': missing_in_wireframe,
        'ghost_screens': ghost_in_wireframe,
        'component_sync_rate': len(set(mockup_components) & set(wireframe_components)) / len(mockup_components)
    }
```

### Threshold
| Metric | Target |
|--------|--------|
| Mâu thuẫn cross-artifact | <5% |
| Missing screens | 0 |
| Ghost components | 0 |
| Component sync rate | 100% |

---

## 6️⃣ End-User Satisfaction

### Định nghĩa
Output của kit thực sự hữu dụng cho designer/engineer cuối.

### Cách đo (Human Evaluation)
```markdown
# Evaluation Form cho người dùng

## Thông tin
- Tên người đánh giá: ___________
- Role: □ Designer □ Engineer □ Producer
- Game concept được dùng: ___________

## Đánh giá (1-5 scale)
1. [ ] Output đủ thông tin để bắt đầu implement (1-5)
2. [ ] Có thể dùng mà không cần sửa lại nhiều (1-5)
3. [ ] Các artifacts nhất quán với nhau (1-5)
4. [ ] Sẵn sàng cho production (1-5)
5. [ ] Tiết kiệm thời gian so với làm manual (1-5)

## Open feedback
- Điều gì tốt nhất?
- Điều gì cần cải thiện?
- Bạn có dùng output này không?
```

### Target Metrics
| Metric | Target | Đo bằng |
|--------|--------|---------|
| "Usable without major changes" | ≥70% | Survey question 2 ≥4★ |
| "Ready for production" | ≥50% | Survey question 4 ≥4★ |
| Implementation time saved | ≥50% | Compare kit vs manual |
| Re-work rounds | ≤1 | Số lần sửa sau khi dùng kit output |

---

## 🔧 Triển khai Eval

### Phase 1: Baseline (1 tuần)
```bash
#!/bin/bash
# eval-baseline.sh

CONCEPTS=(
  "tower-defense-rpg"
  "hyper-casual-runner"
  "midcore-strategy"
  "puzzle-adventure"
  "simulation-tycoon"
  "action-roguelike"
  "narrative-visual-novel"
  "multiplayer-battle-arena"
  "idle-rpg"
  "sports-manager"
)

mkdir -p eval/baseline
for concept in "${CONCEPTS[@]}"; do
  echo "Running: $concept"
  claude --print "/design-kit:create $concept" \
    > "eval/baseline/${concept}.json"
  sleep 30  # Rate limit
done

# Tổng hợp
python3 eval/summarize-baseline.py --input eval/baseline/
```

### Phase 2: Optimization (liên tục)
```bash
# 1. Identify weakest metric từ baseline
python3 eval/analyze.py --find-weakest

# 2. Tuning (ví dụ: Step Efficiency thấp)
# - Thêm constraints vào agent prompts
# - Đổi model cho phù hợp hơn
# - Refine delegation logic

# 3. Re-run và so sánh
./eval-baseline.sh --compare-with eval/baseline/
```

### Phase 3: Regression Testing
```bash
#!/bin/bash
# eval-regression.sh - Chạy sau mỗi update lớn

# Re-run 10 test cases
./eval-baseline.sh --subset 10 --output eval/regression/$(date +%Y%m%d)/

# So sánh với baseline
python3 eval/compare.py \
  --baseline eval/baseline/ \
  --current eval/regression/$(date +%Y%m%d)/ \
  --report eval/regression-report.md
```

---

## 📊 Report Template

```markdown
# Game Design Kit Evaluation Report
**Generated:** $(date)
**Version:** Kit v1.x

## 1. Task Completion Rate
| Run | Concept | Completed | Gate Failed | Time |
|-----|---------|-----------|-------------|------|
| 1 | Tower Defense | ✅ Gate 4 | - | 3.5h |
| 2 | Hyper-casual | ❌ Gate 2 | Mockup | 2.1h |
| ... | ... | ... | ... | ... |
| **Rate** | **85%** | Target: ≥80% | 🟢 | - |

## 2. Step Efficiency
- Avg tool calls: 42 (target: <50) 🟢
- Avg agent switches: 8 (target: <10) 🟢
- Avg review rounds: 1.5 (target: ≤2) 🟢
- Avg time: 3.2h (target: <4h) 🟢

## 3. Cost per Output
| Artifact | Avg Cost | Target | Status |
|----------|----------|--------|--------|
| Concept | $0.75 | <$1 | 🟢 |
| GCD | $3.20 | <$5 | 🟢 |
| Prototype | $1.50 | <$2 | 🟢 |
| Mockup | $2.80 | <$4 | 🟢 |
| Wireframe | $1.20 | <$2 | 🟢 |
| Detail Docs | $4.50 | <$6 | 🟢 |
| **Total** | **$13.95** | **<$15** | 🟢 |

## 4. Consistency (5 runs same input)
- Success rate variance: 6% (target: <10%) 🟢
- Quality score variance: 0.3★ (target: <0.5★) 🟢
- No regression detected ✅

## 5. Cross-Validation
- Cross-artifact conflicts: 2% (target: <5%) 🟢
- Missing screens: 0 ✅
- Ghost components: 0 ✅
- Component sync rate: 98% 🟢

## 6. User Satisfaction (n=5 evaluators)
- Usable without major changes: 80% (target: ≥70%) 🟢
- Ready for production: 60% (target: ≥50%) 🟢
- Time saved: 65% (target: ≥50%) 🟢

## Tổng kết Status
🟢 **PASS** - Kit đạt tiêu chuẩn "tốt" trên cả 6 phương diện

## Top Issues cần cải thiện
1. Mockup phase hay bị REJECT lần 2 → Thêm auto-validator dom-grab
2. Lightweight GCD thiếu rule/edge-case thực tế từ prototype → Update `game-prototype` GCD extraction checklist

## Recommendations
- [ ] Thêm auto-validator cho dom-grab integration
- [ ] Update `game-prototype` Phase 3 checklist để cover đủ state schema, resolve rules, edge cases
- [ ] Dùng Kimi K2.5 cho Tier 1 agents để giảm cost thêm 30%
```

---

## 🔗 Tích hợp vào CI/CD (Tùy chọn)

```yaml
# .github/workflows/eval-kit.yml
name: Kit Evaluation
on:
  push:
    paths:
      - 'agents/**'
      - 'references/**'
      - 'skills/**'

jobs:
  eval:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Run Baseline Eval
        run: |
          ./scripts/eval-baseline.sh --subset 3
      - name: Check Thresholds
        run: |
          python3 eval/check-thresholds.py --report eval/report.json
      - name: Comment PR
        if: failure()
        uses: actions/github-script@v7
        with:
          script: |
            github.rest.issues.createComment({
              issue_number: context.issue.number,
              owner: context.repo.owner,
              repo: context.repo.repo,
              body: '⚠️ Kit evaluation failed - xem logs'
            })
```

---

## 📚 Reference

- [Anthropic: Demystifying evals for AI agents](https://www.anthropic.com/engineering/demystifying-evals-for-ai-agents)
- [Six Key Metrics for AI Agent Evaluation](https://blog.dailydoseofds.com/p/six-key-metrics-for-ai-agent-evaluation)
- [Claude Code documentation](https://docs.anthropic.com/en/docs/claude-code)

---

**Lưu ý:** Chạy baseline eval ít nhất 1 lần trước khi tuyên bố kit "tốt". 
Số liệu phải được cập nhật liên tục sau mỗi lần update kit.
