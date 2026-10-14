# WORKOUTS PRO — COMPLETE FEATURE MATRIX & TWO-WAY DATA CONTRACT
> **Official Engineering & Product Blueprint: Problem-First Breakdown & Closed-Loop Architecture**  
> *Date: October 13, 2026 | Status: Master Reference Approved*

---

## 🏛️ 1. Tashkhees el-Mashakel el-Asasya (The Core System Failures)

Abl ma n7ot ay 7all aw nebny ay screen, lazm n7added **El-Mashakel el-Arba3a el-Ra2esya** elly et-walaadit mn fatret el-prototype:

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                       THE 4 STRUCTURAL FAILURES                             │
│                                                                             │
│  [1. Ghost Dashboards]  ──► Coach sees photos & tape cm, but NO inputs exist │
│  [2. Broken Loops]      ──► Coach writes reviews, but Trainee has no inbox  │
│  [3. Fake Metrics]      ──► Readiness & Volume calculated from thin air     │
│  [4. Intake Black Hole] ──► Onboarding info lost in WhatsApp chat           │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

### 🚨 El-Moshkela #1: Ghost Dashboards (Shashat Shabah)
* **El-Waqe3 fel-Code el-Haly:**
  Lama el-Coach byfta7 [`ClientCheckInsTab.tsx`](file:///d:/gym/src/components/coach/client-detail/ClientCheckInsTab.tsx) aw [`PhotoComparisonModal.tsx`](file:///d:/gym/src/components/coach/client-detail/PhotoComparisonModal.tsx)، byla2y جدول فيه تواريخ، صور مقارنة (Front/Side/Back)، مقاسات وسط وصدر وفخذ، وتقييمات نوم وهضم وطاقة من 1 لـ 5.
* **El-Khallal el-Fani:**
  لو دورت في كل فولدر [`src/components/trainee/`](file:///d:/gym/src/components/trainee/)، **مش هتلاقي فورم واحدة أو شاشة بتسمح للمتدرب إنه يدخل مقاساته أو يرفع صوره أسبوعياً!** البيانات المعروضة دي إما Mock Data ثابتة أو هتفضل فاضية للأبد لأن الـ Trainee معندوش وسيلة إدخال.

### 🚨 El-Moshkela #2: Broken Feedback Loops (7alaqat Ma2too3a)
* **El-Waqe3 fel-Code el-Haly:**
  الـ Coach عنده في شاشة الـ Check-in وشاشة الـ Form Checks زرار وكومنت بوكس عشان يكتب feedback أو يسجل فويس نوت أو يوافق على أوزان المتدرب.
* **El-Khallal el-Fani:**
  الـ Trainee لما بيفتح الـ App بتاعه، **معندوش Notification Center أو Feedback Inbox يشوف فيه الكوتش رد عليه بإيه!** اللوب مقطوعة في اتجاه واحد: الكوتش بيكتب والرد بيختفي في الـ Database ومبيوصلش للشاشة اللي المتدرب بيستخدمها في يومه.

### 🚨 El-Moshkela #3: Fake Telemetry & Hardcoded Metrics (Arqam Hallucinated)
* **El-Waqe3 fel-Code el-Haly:**
  في شاشات الـ Trainee زي [`ProtocolReadinessCard.tsx`](file:///d:/gym/src/components/trainee/dashboard/ProtocolReadinessCard.tsx) وشاشات الكوتش زي Strength Index، فيه نسب مئوية بتظهر (مثلاً: `+24% Strength Index` أو `Readiness Score: 87%`).
* **El-Khallal el-Fani:**
  الأرقام دي مش مربوطة بمعادلات رياضية حقيقية جاية من الـ Workouts اللي المتدرب لعبها في الجيم، بل مجرد أرقام Static محطوطة عشان شكل الـ UI يبقى شيك وقت الـ Prototype.

### 🚨 El-Moshkela #4: Intake Black Hole (Dokhool 3ashwa2i)
* **El-Waqe3 fel-Code el-Haly:**
  عشان الكوتش يضيف متدرب جديد، بيفتح مودال [`NewTraineeModal.tsx`](file:///d:/gym/src/components/modals/NewTraineeModal.tsx) ويكتب اسمه وإيميله وباقته يدوي.
* **El-Khallal el-Fani:**
  تاريخ الإصابات، نوع الجيم المتاح (أجهزة ولا دامبلز بس)، الأكلات اللي المتدرب بيكرهها أو بتعمله حساسية، وطبيعة شغله اليومي مفيش أي شاشة بتجمعهم، وبيضطر الكوتش يسألهم في شات واتساب طويل والمعلومات دي بتضيع ومبتتسجلش في الـ System.

---

## 💡 2. Mabda2 el-7all el-Me3mari (The Golden Resolution Contract)

> **قاعدة الصفر في البيانات الوهمية (Zero-Ghost Law):**  
> 1. أي رقم أو صورة أو مقاس بيظهر عند الكوتش لازم يكون ليه **Action شاشة إدخال حقيقية** عند المتدرب.
> 2. أي قرار أو تعديل أو تقييم بيعمله الكوتش لازم ينزل في **View مخصص للمتدرب** يوجهه للأسبوع الجديد.
> 3. أي نسبة مئوية أو مؤشر أداء لازم يكون **Pure Deterministic Calculation** جاي من تمرين أو أكل حقيقي.

---

## 🔍 3. Feature-by-Feature: El-Moshkela ➔ El-7all

هنا كل Module متفصص بدقة: إيه المشكلة الحالية بالظبط، وإيه الحل البرمجي والهندسي ليها:

---

### Feature Domain 1: Weekly Check-In & Body Composition

#### 🚨 El-Moshkela:
- الكوتش في [`ClientCheckInsTab.tsx`](file:///d:/gym/src/components/coach/client-detail/ClientCheckInsTab.tsx) مستني يشوف: (وزن الصبح، مقاسات الوسط، 3 صور، تقييم 5 عناصر حيوية).
- المتدرب معندوش أي شاشة يدخل منها البيانات دي يوم الـ Check-in بتاعه.

#### 💡 El-7all:
1. **بناء `TraineeCheckInModal.tsx` (Trainee Input Wizard):**
   - **Step 1 (المقاسات):** إدخال وزن الصبح بدقة `0.1kg` + مقاس الوسط بالسنتيمتر + الصدر/الذراع/الفخذ.
   - **Step 2 (الصور):** 3 أماكن رفع للصور (Front, Side, Back) مع ضغط تلقائي WebP ورفع مباشر لـ Cloudflare R2 بدون إرهاق السيرفر.
   - **Step 3 (المؤشرات الحيوية):** 5 Sliders سريعة من 1 لـ 5 لـ (Sleep, Energy, Hunger, Digestion, Stress) + خانة ملاحظات حرة.
2. **Persistence:** تسجيل الداتا في جدول `weekly_checkins` في الـ PostgreSQL، وده اللي بيغذي شاشة الكوتش تلقائياً.

---

### Feature Domain 2: Technique Audit & Form Checks

#### 🚨 El-Moshkela:
- الكوتش عنده تاب كامل اسمه [`ClientFormChecksTab.tsx`](file:///d:/gym/src/components/coach/client-detail/ClientFormChecksTab.tsx) لمراجعة تكنيك التمارين.
- المتدرب وهو في الجيم معندوش أي وسيلة يرفع بيها فيديو لتمرينة لعبها حالاً عشان الكوتش يشوفها.

#### 💡 El-7all:
1. **بناء `SubmitFormCheckModal.tsx` (Gym Floor Fast Upload):**
   - بيفتح بزرار مباشر من داخل شاشة التمرين [`LiveWorkoutSession.tsx`](file:///d:/gym/src/components/trainee/LiveWorkoutSession.tsx) بجانب كل تمرين.
   - بيسحب أوتوماتيك اسم التمرين ورقم الـ Set والوزن المكتوب.
   - بيسمح برفع فيديو مباشر أو لصق رابط فيديو غير مدرج (YouTube Unlisted / Drive).
   - خانة ملاحظة سريعة للمتدرب: "حاسس بوجع في كتفي في آخر 2 ريب".
2. **Notification Loop:** الفيديو بيتحط في الـ Database بحالة `pending` وبيظهر إشعار فوري للكوتش إن فيه فيديو محتاج مراجعة.

---

### Feature Domain 3: Client Onboarding & Medical Intake

#### 🚨 El-Moshkela:
- إضافة المتدرب بتتم بشكل يدوي وسطحي جداً في [`NewTraineeModal.tsx`](file:///d:/gym/src/components/modals/NewTraineeModal.tsx).
- مفيش تسجيل رسمي للإصابات، تفضيلات الدايت، الأجهزة المتوفرة في الجيم، أو طبيعة النشاط اليومي.

#### 💡 El-7all:
1. **بناء `TraineeOnboardingForm.tsx` (Athlete Intake Flow):**
   - أول ما المتدرب يفتح حسابه لأول مرة، بيظهرله استبيان ذكي من 4 خطوات:
     - **القياسات المبدئية:** السن، الطول، الوزن، الهدف الرياضي الأساسي.
     - **الملف الطبي والإصابات:** هل فيه إصابة سابقة في (الركبة، القطنية، الكتف)؟
     - **بيئة التدريب:** بيتمرن في جيم تجاري ضخم ولا جيم متواضع ولا في البيت بدامبلز فقط؟
     - **العادات الغذائية:** أكلات ممنوعة أو حساسية طعام، عدد الوجبات المفضلة في اليوم.
2. **Auto-Populate:** الإجابات بتنزل مباشرة في ملف المتدرب في [`ClientOverviewTab.tsx`](file:///d:/gym/src/components/coach/client-detail/ClientOverviewTab.tsx)، فالكوتش يبني الخطة على أساس طبي دقيق.

---

### Feature Domain 4: Coach Feedback Delivery & Next Week Orders

#### 🚨 El-Moshkela:
- لما الكوتش يراجع الـ Check-in ويكتب ملاحظاته أو يسجل فويس نوت، المتدرب مبيظهرلوش أي شاشة منظمة تعرضله الكلام ده.

#### 💡 El-7all:
1. **بناء `CheckInFeedbackView.tsx` (Trainee Review Screen):**
   - أول ما الكوتش يعمل `reviewed = true`، يظهر Banner للمتدرب في الـ Dashboard: *"Coach reviewed your check-in!"*.
   - الشاشة بتعرض:
     - ملخص قرار الكوتش (مثلاً: نزول 800 جرام - السعرات ثابتة - تم زيادة 500 خطوة).
     - مشغل صوتي للفويس نوت المباشر من الكوتش.
     - سلايدر مقارنة الصور اللي الكوتش شافه عشان المتدرب يشوف تطوره بعينه.
     - التوجيهات المكتوبة للأسبوع الجديد.

---

### Feature Domain 5: Daily Nutrition Compliance & Smart Swaps

#### 🚨 El-Moshkela:
- الدايت مكتوب عند الكوتش وعند المتدرب، بس مفيش آلية واضحة لحساب هل المتدرب التزم فعلاً بالوجبات دي على مدار الأسبوع ولا لأ.
- المتدرب لو غير وجبة ببديل (Smart Swap)، الكوتش مبيعرفش ده حصل ولا لأ.

#### 💡 El-7all:
1. **ربط الـ Daily Checklist بالـ State:**
   - لما المتدرب يعمل Check على وجبة في [`DailyMealsChecklist.tsx`](file:///d:/gym/src/components/trainee/dashboard/DailyMealsChecklist.tsx)، بتتسجل كـ `completed = true`.
   - لما يختار بديل (مثلاً رز بسمتي بديل بطاطس) من قائمة الـ Badeel، بيتسجل الـ Swap في جدول اليوم.
2. **Calculated Adherence:**
   - نسبة التزام الدايت اللي الكوتش بيشوفها بتتحسب أوتوماتيك:  
     $$\text{Adherence \%} = \frac{\text{الوجبات المنفذة في آخر 7 أيام}}{\text{إجمالي الوجبات المطلوبة}} \times 100$$
   - مفيش رقم تقريبي وهمي.

---

### Feature Domain 6: Subscriptions & Package Lifecycle

#### 🚨 El-Moshkela:
- الكوتش بيحدد الباقة ومدتها في [`ClientMembershipModal.tsx`](file:///d:/gym/src/components/coach/client-detail/ClientMembershipModal.tsx).
- المتدرب مبيكونش عارف باقي كام يوم في اشتراكه إلا لما الكوتش يفكره يدوي، ومفيش وسيلة سريعة يجدد بيها.

#### 💡 El-7all:
1. **إضافة `SubscriptionStatusCard.tsx` للمتدرب:**
   - كارت في الـ Profile بتاعه مكتوب فيه: *"باقي 12 يوم على نهاية الاشتراك"*.
   - لما يقرب ينتهي (أقل من 7 أيام)، يظهر زرار مباشر: *"تجديد الاشتراك مع الكوتش عبر واتساب"* بمسج جاهز فيه تفاصيل الباقة.

---

## 📋 4. Master Feature Contract Matrix

| Feature | Coach Action (Write / Read) | Trainee Action (Write / Read) | Missing Component Needed | Priority |
| :--- | :--- | :--- | :--- | :--- |
| **Weekly Check-In** | **Read:** Scale, tape cm, 3-angle photos, biofeedback. | **Write:** Submits data & photos weekly via wizard. | `TraineeCheckInModal.tsx` | 🔴 Critical |
| **Form Check Videos** | **Read & Review:** Watches video, writes critique, changes status. | **Write:** Uploads gym video with exercise & set tag. | `SubmitFormCheckModal.tsx` | 🔴 Critical |
| **Athlete Intake** | **Read:** Reads injuries, equipment, medical background. | **Write:** Fills 4-step intake on first app launch. | `TraineeOnboardingForm.tsx` | 🔴 Critical |
| **Review Feedback** | **Write:** Submits review decision & voice note. | **Read:** Inspects weekly decisions & side-by-side photos. | `CheckInFeedbackView.tsx` | 🟡 High |
| **Workout Logs** | **Read:** Real weights, volume, reps, PRs. | **Write:** Logs live sets in gym mode. | Already implemented | 🟢 Complete |
| **Diet Checklist** | **Read:** Weekly compliance %, logged swaps. | **Write:** Ticks meals, switches items with Badeel. | Already implemented | 🟢 Complete |
| **Habits & Quit** | **Read:** Consistency streaks, relapse logs. | **Write:** Toggles daily habits, resets quit timer. | Already implemented | 🟢 Complete |
| **Membership** | **Write:** Sets plan duration, price, expiry. | **Read:** Sees countdown badge, WhatsApp renewal CTA. | `SubscriptionStatusCard.tsx` | 🟡 Medium |

---

## 🎯 5. Khotet el-Tanfeez (Action Order)

1. **Step 1:** بناء شاشات الـ Inputs الأساسية (`TraineeCheckInModal.tsx` و `SubmitFormCheckModal.tsx`).
2. **Step 2:** بناء شاشة الـ Onboarding للمتدربين الجدد (`TraineeOnboardingForm.tsx`).
3. **Step 3:** بناء شاشة استلام رد الكوتش (`CheckInFeedbackView.tsx`).
4. **Step 4:** ربط الأرقام والإحصائيات بالمعادلات الرياضية الخالصة وإلغاء أي Fallback ثابت.
