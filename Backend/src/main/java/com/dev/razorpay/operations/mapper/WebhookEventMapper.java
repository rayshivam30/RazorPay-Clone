package com.dev.razorpay.operations.mapper;

import com.dev.razorpay.operations.dto.response.WebhookEventResponse;
import com.dev.razorpay.operations.entity.WebhookEvent;
import org.mapstruct.Mapper;
import org.mapstruct.MappingConstants;

import java.util.List;

@Mapper(componentModel = MappingConstants.ComponentModel.SPRING)
public interface WebhookEventMapper {

    WebhookEventResponse toResponse(WebhookEvent webhookEvent);

    List<WebhookEventResponse> toResponseList(List<WebhookEvent> webhookEvents);
}
