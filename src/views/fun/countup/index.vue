<template>
  <div>
    <el-card shadow="hover" :header="$t('message.fun.countup')">
      <el-alert
        :title="$t('message.fun.attrCountup')"
        type="success"
        :closable="false"
        class="mb15"
      ></el-alert>
      <el-row :gutter="20">
        <el-col :sm="6" class="mb15" v-for="(v, k) in topCardItemList" :key="k">
          <div
            class="countup-card-item countup-card-item-box"
            :style="{ background: `var(${v.color})` }"
          >
            <div class="countup-card-item-flex" ref="topCardItemRefs">
              <div class="countup-card-item-title pb3">{{ v.title }}</div>
              <div class="countup-card-item-title-num pb6"></div>
              <div class="countup-card-item-tip pb3">{{ v.tip }}</div>
              <div class="countup-card-item-tip-num"></div>
            </div>
            <i :class="v.icon" :style="{ color: v.iconColor }"></i>
          </div>
        </el-col>
      </el-row>
      <div class="flex-warp">
        <div class="flex-warp-item">
          <div class="flex-warp-item-box">
            <el-button type="primary" size="default" @click="refreshCurrent">
              <el-icon>
                <ele-RefreshRight />
              </el-icon>
              {{ $t("message.fun.btnRefreshNum") }}
            </el-button>
          </div>
        </div>
      </div>
    </el-card>
  </div>
</template>

<script lang="ts">
import { reactive, toRefs, onMounted, onBeforeUnmount, nextTick, defineComponent } from "vue";
import { useI18n } from "vue-i18n";
import { CountUp } from "countup.js";

export default defineComponent({
  name: "funCountup",
  setup() {
    const { t } = useI18n();
    const countUpInstances: CountUp[] = [];
    const state = reactive({
      topCardItemRefs: null as any,
      topCardItemList: [
        {
          title: t("message.fun.countVisitors"),
          titleNum: "123",
          tip: t("message.fun.countPresent"),
          tipNum: "911",
          color: "--el-color-primary",
          iconColor: "#ffcb47",
          icon: "iconfont icon-jinridaiban",
        },
        {
          title: t("message.fun.countLabTotal"),
          titleNum: "123",
          tip: t("message.fun.countInUse"),
          tipNum: "611",
          color: "--el-color-success",
          iconColor: "#70cf41",
          icon: "iconfont icon-AIshiyanshi",
        },
        {
          title: t("message.fun.countApplicants"),
          titleNum: "123",
          tip: t("message.fun.countApproved"),
          tipNum: "911",
          color: "--el-color-warning",
          iconColor: "#dfae64",
          icon: "iconfont icon-shenqingkaiban",
        },
        {
          title: t("message.fun.countSales"),
          titleNum: "123",
          tip: t("message.fun.countSalesNum"),
          tipNum: "911",
          color: "--el-color-danger",
          iconColor: "#e56565",
          icon: "iconfont icon-ditu",
        },
      ],
    });
    // 初始化数字滚动
    const initNumCountUp = () => {
      nextTick(() => {
        state.topCardItemRefs.forEach((v: HTMLDivElement) => {
          const c1 = new CountUp(
            v.querySelector(".countup-card-item-title-num") as HTMLDivElement,
            Math.random() * 10000,
          );
          const c2 = new CountUp(
            v.querySelector(".countup-card-item-tip-num") as HTMLDivElement,
            Math.random() * 1000,
          );
          c1.start();
          c2.start();
          countUpInstances.push(c1, c2);
        });
      });
    };
    // 重置/刷新数值
    const refreshCurrent = () => {
      initNumCountUp();
    };
    // 页面加载时
    onMounted(() => {
      initNumCountUp();
    });
    // 组件卸载时清理 CountUp 实例（停止动画循环）
    onBeforeUnmount(() => {
      countUpInstances.forEach((instance) => {
        instance.reset();
      });
      countUpInstances.length = 0;
    });
    return {
      refreshCurrent,
      ...toRefs(state),
    };
  },
});
</script>

<style scoped>
.countup-card-item {
  width: 100%;
  height: 103px;
  background: var(--el-text-color-secondary);
  border-radius: 4px;
  transition: all ease 0.3s;
  &:hover {
    box-shadow: 0 2px 12px 0 rgb(0 0 0 / 10%);
    transition: all ease 0.3s;
  }
}
.countup-card-item-box {
  display: flex;
  align-items: center;
  position: relative;
  overflow: hidden;
  &:hover {
    i {
      right: 0px !important;
      bottom: 0px !important;
      transition: all ease 0.3s;
    }
  }
  i {
    position: absolute;
    right: -10px;
    bottom: -10px;
    font-size: 70px;
    transform: rotate(-30deg);
    transition: all ease 0.3s;
  }
  .countup-card-item-flex {
    padding: 0 20px;
    color: var(--el-color-white);
    .countup-card-item-title,
    .countup-card-item-tip {
      font-size: 13px;
    }
    .countup-card-item-title-num {
      font-size: 18px;
    }
    .countup-card-item-tip-num {
      font-size: 13px;
    }
  }
}
</style>
