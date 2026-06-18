<template>
  <div class="movie-editor">
    <div class="section-header">
      <el-icon><ele-VideoCamera /></el-icon>
      <span>{{ $t("message.cms.movie.title") }}</span>
    </div>
    <div class="section-desc">{{ $t("message.cms.movie.desc") }}</div>

    <div v-for="(group, gIdx) in groups" :key="gIdx" class="player-group">
      <div class="group-bar">
        <el-input
          v-model="group.group_name"
          :placeholder="$t('message.cms.movie.groupNamePlaceholder')"
          size="small"
          class="group-name-input"
        />
        <span class="group-count">{{ countUrls(group) }} 集</span>
        <el-button text size="small" @click="toggleGroup(gIdx)">
          {{ group._expanded ? $t("message.cms.movie.collapse") : $t("message.cms.movie.expand") }}
        </el-button>
        <el-button text size="small" type="danger" @click="removeGroup(gIdx)">{{
          $t("message.cms.movie.deleteGroup")
        }}</el-button>
      </div>

      <div v-show="group._expanded" class="group-body">
        <div class="batch-area">
          <el-input
            v-model="group._batchText"
            type="textarea"
            :rows="3"
            placeholder="1$Title$URL&#10;2$Title$URL&#10;Or paste URLs directly"
            size="small"
            @keydown.enter.prevent="parseBatch(gIdx)"
          />
          <div class="batch-actions">
            <el-button size="small" type="primary" link @click="parseBatch(gIdx)">{{
              $t("message.cms.movie.btnParse")
            }}</el-button>
            <el-button size="small" link @click="clearBatch(gIdx)">{{
              $t("message.cms.movie.btnClear")
            }}</el-button>
          </div>
        </div>

        <div class="url-table">
          <div class="url-table-header">
            <span class="col-ep">{{ $t("message.cms.movie.colEpisode") }}</span>
            <span class="col-title">{{ $t("message.cms.movie.colTitle") }}</span>
            <span class="col-url">{{ $t("message.cms.movie.colUrl") }}</span>
            <span class="col-sort">{{ $t("message.cms.movie.colSort") }}</span>
            <span class="col-action">{{ $t("message.cms.movie.colAction") }}</span>
          </div>
          <div v-for="(url, uIdx) in group.urls" :key="uIdx" class="url-row">
            <span class="col-ep"
              ><el-input
                v-model="url.episode_num"
                type="number"
                min="0"
                size="small"
                class="episode-input"
            /></span>
            <span class="col-title"
              ><el-input
                v-model="url.episode_title"
                size="small"
                :placeholder="$t('message.cms.movie.colTitle')"
                class="full-input"
            /></span>
            <span class="col-url"
              ><el-input v-model="url.play_url" size="small" placeholder="https://..."
            /></span>
            <span class="col-sort"
              ><el-input v-model="url.sort" type="number" min="0" size="small" class="sort-input"
            /></span>
            <span class="col-action"
              ><el-button link size="small" type="danger" @click="removeUrl(gIdx, uIdx)">{{
                $t("message.common.delete")
              }}</el-button></span
            >
          </div>
        </div>

        <el-button size="small" type="primary" link class="mt8" @click="addUrl(gIdx)">
          <el-icon><ele-Plus /></el-icon> {{ $t("message.cms.movie.addLine") }}
        </el-button>
      </div>
    </div>

    <el-button size="small" plain class="mt8" @click="addGroup">
      <el-icon><ele-Plus /></el-icon> {{ $t("message.cms.movie.addGroup") }}
    </el-button>

    <div class="section-header section-header--spaced">
      <el-icon><ele-User /></el-icon>
      <span>{{ $t("message.cms.movie.actorTitle") }}</span>
    </div>

    <div class="actor-table">
      <div class="actor-table-header">
        <span class="col-actor">{{ $t("message.cms.movie.actorName") }}</span>
        <span class="col-role">{{ $t("message.cms.movie.actorRole") }}</span>
        <span class="col-sort">{{ $t("message.cms.movie.colSort") }}</span>
        <span class="col-action">{{ $t("message.cms.movie.colAction") }}</span>
      </div>
      <div v-for="(role, idx) in actors" :key="idx" class="actor-row">
        <span class="col-actor">
          <el-select
            v-model="role.actor_id"
            filterable
            allow-create
            default-first-option
            :placeholder="$t('message.cms.movie.actorSearch')"
            size="small"
            class="actor-select"
            @visible-change="(v: boolean) => v && searchActors('')"
            @change="(val: any) => onActorSelected(role, val)"
          >
            <el-option v-for="a in actorOptions" :key="a.id" :label="a.name" :value="a.id" />
          </el-select>
        </span>
        <span class="col-role"
          ><el-input
            v-model="role.role_name"
            :placeholder="$t('message.cms.movie.actorRoleName')"
            size="small"
            class="role-input"
        /></span>
        <span class="col-sort"
          ><el-input v-model="role.sort" type="number" min="0" size="small" class="sort-input"
        /></span>
        <span class="col-action"
          ><el-button link size="small" type="danger" @click="removeActor(idx)">{{
            $t("message.common.delete")
          }}</el-button></span
        >
      </div>
    </div>

    <el-button size="small" plain class="mt8" @click="addActor">
      <el-icon><ele-Plus /></el-icon> {{ $t("message.cms.movie.addActor") }}
    </el-button>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, watch, nextTick } from "vue";
import { searchActor, addActor } from "/@/api/addon/movie";
import { ElMessage } from "element-plus";
import { useI18n } from "vue-i18n";

interface UrlData {
  episode_num: number;
  episode_title: string;
  play_url: string;
  sort: number;
}
interface GroupData {
  group_name: string;
  sort: number;
  urls: UrlData[];
  _expanded: boolean;
  _batchText: string;
}
interface ActorData {
  actor_id: number | string;
  actor_name: string;
  role_name: string;
  sort: number;
}

export default defineComponent({
  name: "MovieEditor",
  props: {
    modelGroups: { type: Array, default: () => [] },
    modelActors: { type: Array, default: () => [] },
  },
  emits: ["update:modelGroups", "update:modelActors"],
  setup(props, { emit }) {
    const { t } = useI18n();
    const groups = ref<GroupData[]>([]);
    const actors = ref<ActorData[]>([]);
    const actorOptions = ref<Array<{ id: number; name: string }>>([]);

    watch(
      () => props.modelGroups,
      (val: any) => {
        if (val && Array.isArray(val)) {
          groups.value = JSON.parse(JSON.stringify(val)).map((g: any) => ({
            ...g,
            urls: g.urls || [],
            _expanded: true,
            _batchText: "",
          }));
        } else {
          groups.value = [];
        }
      },
      { immediate: true, deep: true },
    );

    watch(
      () => props.modelActors,
      (val: any) => {
        if (val && Array.isArray(val)) {
          actors.value = JSON.parse(JSON.stringify(val));
        } else {
          actors.value = [];
        }
      },
      { immediate: true, deep: true },
    );

    function sync() {
      emit(
        "update:modelGroups",
        JSON.parse(JSON.stringify(groups.value.map(({ _expanded, _batchText, ...g }) => g))),
      );
      emit("update:modelActors", JSON.parse(JSON.stringify(actors.value)));
    }
    function countUrls(g: GroupData) {
      return g.urls?.length || 0;
    }
    function addGroup() {
      groups.value.push({ group_name: "", sort: 0, urls: [], _expanded: true, _batchText: "" });
      sync();
    }
    function removeGroup(idx: number) {
      groups.value.splice(idx, 1);
      sync();
    }
    function toggleGroup(idx: number) {
      groups.value[idx]._expanded = !groups.value[idx]._expanded;
    }
    function addUrl(gIdx: number) {
      groups.value[gIdx].urls.push({ episode_num: 1, episode_title: "", play_url: "", sort: 0 });
      sync();
    }
    function removeUrl(gIdx: number, uIdx: number) {
      groups.value[gIdx].urls.splice(uIdx, 1);
      sync();
    }

    function parseBatch(gIdx: number) {
      const text = groups.value[gIdx]._batchText?.trim();
      if (!text) return;
      const lines = text
        .split("\n")
        .map((l) => l.trim())
        .filter(Boolean);
      const urls: UrlData[] = [];
      let sortBase = groups.value[gIdx].urls.length;
      for (const line of lines) {
        const parts = line.split("$");
        if (parts.length >= 2 && /^\d+$/.test(parts[0].trim())) {
          urls.push({
            episode_num: parseInt(parts[0].trim()),
            episode_title: parts.length >= 3 ? parts[1].trim() : "",
            play_url:
              parts.length >= 3 ? parts.slice(2).join("$").trim() : parts.slice(1).join("$").trim(),
            sort: sortBase++,
          });
        } else if (/^https?:\/\//.test(line)) {
          urls.push({ episode_num: 0, episode_title: "", play_url: line, sort: sortBase++ });
        }
      }
      if (urls.length > 0) {
        groups.value[gIdx].urls.push(...urls);
        groups.value[gIdx]._batchText = "";
        sync();
        ElMessage.success(
          `${t("message.cms.movie.imported")} ${urls.length} ${t("message.cms.movie.items")}`,
        );
      }
    }
    function clearBatch(gIdx: number) {
      groups.value[gIdx]._batchText = "";
    }

    async function searchActors(keyword: string) {
      try {
        const res: any = await searchActor(keyword);
        actorOptions.value = (res.data?.list || res?.list || []).map((a: any) => ({
          id: a.id,
          name: a.name,
        }));
      } catch {
        /* ignore */
      }
    }
    async function onActorSelected(role: ActorData, val: any) {
      const found = actorOptions.value.find((a) => a.id === val);
      if (found) {
        role.actor_name = found.name;
      } else if (typeof val === "string" && val.trim()) {
        try {
          const res: any = await addActor(val.trim());
          const newId = res.data?.id || res?.id;
          if (newId) {
            role.actor_id = newId;
            role.actor_name = val.trim();
            await searchActors("");
          }
        } catch {
          ElMessage.error(t("message.cms.movie.actorCreateFail"));
        }
      }
      sync();
    }
    function addActor() {
      actors.value.push({ actor_id: "", actor_name: "", role_name: "", sort: 0 });
      sync();
    }
    function removeActor(idx: number) {
      actors.value.splice(idx, 1);
      sync();
    }

    return {
      groups,
      actors,
      actorOptions,
      countUrls,
      addGroup,
      removeGroup,
      toggleGroup,
      addUrl,
      removeUrl,
      parseBatch,
      clearBatch,
      searchActors,
      onActorSelected,
      addActor,
      removeActor,
    };
  },
});
</script>

<style scoped>
.movie-editor {
  display: flex;
  flex-direction: column;
  gap: var(--cc-space-3);
  margin-top: var(--cc-space-3);
}
.section-header {
  display: flex;
  align-items: center;
  gap: var(--cc-space-2);
  padding: 0 0 var(--cc-space-2);
  margin-bottom: var(--cc-space-1);
  border-bottom: 1px solid var(--cc-color-border-light);
  color: var(--cc-color-text-1);
  font-size: var(--cc-font-15);
  font-weight: 700;
}
.section-header :deep(.el-icon) {
  color: var(--cc-color-primary);
}
.section-header--spaced {
  margin-top: var(--cc-space-4);
}
.section-desc {
  margin-bottom: var(--cc-space-2);
  color: var(--cc-color-text-3);
  font-size: var(--cc-font-12);
  line-height: 1.6;
}
.player-group {
  overflow: hidden;
  margin-bottom: var(--cc-space-2);
  background: var(--cc-color-surface);
  border: 1px solid var(--cc-color-border-light);
  border-radius: var(--cc-radius-lg);
  box-shadow: var(--cc-shadow-xs);
}
.group-bar {
  display: flex;
  align-items: center;
  gap: var(--cc-space-2);
  padding: var(--cc-space-3) var(--cc-space-4);
  background: var(--cc-color-bg);
  border-bottom: 1px solid var(--cc-color-border-light);
}
.group-name-input {
  width: 220px;
}
.group-count {
  margin-left: auto;
  color: var(--cc-color-text-3);
  font-size: var(--cc-font-12);
}
.group-body {
  background: var(--cc-color-surface);
}
.batch-area {
  padding: var(--cc-space-3) var(--cc-space-4);
  background: var(--cc-color-surface-hover);
  border-bottom: 1px dashed var(--cc-color-border-light);
}
.batch-actions {
  display: flex;
  justify-content: flex-end;
  gap: var(--cc-space-2);
  margin-top: var(--cc-space-2);
}
.url-table,
.actor-table {
  padding: var(--cc-space-2) var(--cc-space-4);
}
.url-table-header,
.url-row,
.actor-table-header,
.actor-row {
  display: flex;
  align-items: center;
  gap: var(--cc-space-2);
  padding: var(--cc-space-2) 0;
}
.url-table-header,
.actor-table-header {
  color: var(--cc-color-text-3);
  font-size: var(--cc-font-12);
  font-weight: 600;
  border-bottom: 1px solid var(--cc-color-border-light);
}
.url-row,
.actor-row {
  border-bottom: 1px solid var(--cc-color-border-light);
}
.url-row:last-child,
.actor-row:last-child {
  border-bottom: none;
}
.col-ep {
  width: 68px;
  flex-shrink: 0;
}
.col-title {
  width: 120px;
  flex-shrink: 0;
}
.col-url {
  flex: 1;
  min-width: 0;
}
.col-sort {
  width: 64px;
  flex-shrink: 0;
  text-align: center;
}
.col-action {
  width: 64px;
  flex-shrink: 0;
  text-align: center;
}
.col-actor {
  width: 200px;
  flex-shrink: 0;
}
.col-role {
  width: 140px;
  flex-shrink: 0;
}
.episode-input {
  width: 58px;
}
.sort-input {
  width: 56px;
}
.full-input {
  width: 100%;
}
.actor-select {
  width: 190px;
}
.role-input {
  width: 130px;
}
.mt8 {
  margin-top: var(--cc-space-2);
}
@media (max-width: 768px) {
  .group-bar,
  .url-table-header,
  .url-row,
  .actor-table-header,
  .actor-row {
    align-items: stretch;
    flex-direction: column;
  }
  .group-name-input,
  .col-ep,
  .col-title,
  .col-url,
  .col-sort,
  .col-action,
  .col-actor,
  .col-role,
  .actor-select,
  .role-input {
    width: 100%;
  }
  .group-count {
    margin-left: 0;
  }
}
</style>
